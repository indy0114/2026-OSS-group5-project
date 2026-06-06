"""실시간 멀티플레이(카훗 스타일) 퀴즈 게임 엔진.

방/게임 상태는 모두 서버 메모리(rooms)에 저장한다. 3~5명 규모의 시연용이라
DB나 Redis 없이 동작한다. 서버 재시작 시 진행 중이던 방은 사라진다.
"""

import asyncio
import random
import string
import time

from fastapi import WebSocket, WebSocketDisconnect


# 방 코드 -> GameRoom
rooms: dict[str, "GameRoom"] = {}

# 라이브 모드에서 시간제한이 없는(0) 문제에 적용할 기본 제한시간(초)
DEFAULT_TIME_LIMIT = 20
# 정답 기본 점수
BASE_SCORE = 1000


def generate_code() -> str:
    """입력하기 쉬운 6자리 숫자 PIN을 생성한다."""
    while True:
        code = "".join(random.choices(string.digits, k=6))
        if code not in rooms:
            return code


def live_time_limit(question: dict) -> int:
    raw = question.get("time_limit") or question.get("timeLimit") or 0
    return raw if isinstance(raw, int) and raw > 0 else DEFAULT_TIME_LIMIT


def correct_option_ids(question: dict) -> list[str]:
    answers = question.get("answers")
    if answers:
        return [str(a) for a in answers]
    answer = question.get("answer")
    return [str(answer)] if answer is not None else []


def check_correct(question: dict, value) -> bool:
    if question.get("type") == "multiple":
        correct = sorted(correct_option_ids(question))
        chosen = sorted(str(v) for v in value) if isinstance(value, list) else [str(value)]
        return correct == chosen
    expected = str(question.get("answer", "")).strip().lower()
    return str(value).strip().lower() == expected


class GameRoom:
    def __init__(self, code: str, quiz: dict, host_user_id: int):
        self.code = code
        self.quiz = quiz
        self.questions: list[dict] = quiz.get("questions", [])
        self.host_user_id = host_user_id
        self.host_ws: WebSocket | None = None
        # player_id -> {ws, nickname, score, streak, user_id}
        self.players: dict[str, dict] = {}
        self.state = "lobby"  # lobby | question | reveal | ended
        self.q_index = -1
        self.question_started_at: float | None = None
        # 현재 문제의 응답: player_id -> {value, correct, award, time_taken}
        self.answers: dict[str, dict] = {}
        self.reveal_task: asyncio.Task | None = None
        self.lock = asyncio.Lock()

    # ---- 전송 헬퍼 ----
    async def send(self, ws: WebSocket | None, message: dict):
        if ws is None:
            return
        try:
            await ws.send_json(message)
        except Exception:
            pass

    async def broadcast_players(self, message: dict):
        for player in list(self.players.values()):
            await self.send(player["ws"], message)

    async def broadcast_all(self, message: dict):
        await self.send(self.host_ws, message)
        await self.broadcast_players(message)

    def lobby_payload(self) -> dict:
        return {
            "type": "lobby",
            "players": [
                {"id": pid, "nickname": p["nickname"]}
                for pid, p in self.players.items()
            ],
            "count": len(self.players),
        }

    def leaderboard(self) -> list[dict]:
        ranked = sorted(
            self.players.items(),
            key=lambda kv: kv[1]["score"],
            reverse=True,
        )
        return [
            {"rank": i + 1, "nickname": p["nickname"], "score": p["score"]}
            for i, (pid, p) in enumerate(ranked)
        ]

    def player_rank(self, player_id: str) -> int:
        for entry in self.leaderboard():
            if entry["nickname"] == self.players[player_id]["nickname"]:
                return entry["rank"]
        return len(self.players)

    # ---- 게임 진행 ----
    async def start_game(self):
        if self.state not in ("lobby", "ended"):
            return
        for player in self.players.values():
            player["score"] = 0
            player["streak"] = 0
        self.q_index = -1
        await self.next_question()

    async def next_question(self):
        if self.reveal_task and not self.reveal_task.done():
            self.reveal_task.cancel()

        self.q_index += 1
        if self.q_index >= len(self.questions):
            await self.end_game()
            return

        self.state = "question"
        self.answers = {}
        self.question_started_at = time.time()
        question = self.questions[self.q_index]
        time_limit = live_time_limit(question)

        # 참가자에게는 정답을 빼고, 보기만 전달
        public_q = {
            "title": question.get("title", ""),
            "description": question.get("description", ""),
            "type": question.get("type", "multiple"),
            # 정답이 여러 개인지만 알려준다(어떤 보기인지는 숨김).
            "multiSelect": len(correct_option_ids(question)) > 1,
            "options": [
                {"id": str(o.get("id")), "text": o.get("text", "")}
                for o in question.get("options", [])
            ],
            "media": question.get("media"),
        }
        await self.broadcast_all(
            {
                "type": "question",
                "index": self.q_index,
                "total": len(self.questions),
                "question": public_q,
                "timeLimit": time_limit,
            }
        )
        self.reveal_task = asyncio.create_task(self._auto_reveal(time_limit))

    async def _auto_reveal(self, delay: int):
        try:
            await asyncio.sleep(delay)
        except asyncio.CancelledError:
            return
        async with self.lock:
            if self.state == "question":
                await self.reveal()

    async def submit_answer(self, player_id: str, value):
        if self.state != "question" or player_id in self.answers:
            return
        if player_id not in self.players:
            return

        question = self.questions[self.q_index]
        time_limit = live_time_limit(question)
        elapsed = time.time() - (self.question_started_at or time.time())
        elapsed = max(0.0, min(elapsed, time_limit))
        correct = check_correct(question, value)

        if correct:
            # 빨리 맞출수록 높은 점수(최소 절반 보장) — 카훗 방식
            award = round(BASE_SCORE * (1 - (elapsed / time_limit) / 2))
            self.players[player_id]["streak"] += 1
            award += (self.players[player_id]["streak"] - 1) * 100  # 연속 정답 보너스
        else:
            award = 0
            self.players[player_id]["streak"] = 0

        self.players[player_id]["score"] += award
        self.answers[player_id] = {
            "value": value,
            "correct": correct,
            "award": award,
            "time_taken": elapsed,
        }

        await self.send(self.players[player_id]["ws"], {"type": "answer_ack"})
        await self.send(
            self.host_ws,
            {"type": "answer_count", "count": len(self.answers), "total": len(self.players)},
        )

        # 전원 응답 시 즉시 공개
        if self.players and len(self.answers) >= len(self.players):
            if self.reveal_task and not self.reveal_task.done():
                self.reveal_task.cancel()
            await self.reveal()

    async def reveal(self):
        if self.state != "question":
            return
        self.state = "reveal"
        question = self.questions[self.q_index]
        correct_ids = correct_option_ids(question)

        # 보기별 응답 분포
        distribution: dict[str, int] = {
            str(o.get("id")): 0 for o in question.get("options", [])
        }
        for ans in self.answers.values():
            val = ans["value"]
            keys = val if isinstance(val, list) else [val]
            for k in keys:
                if str(k) in distribution:
                    distribution[str(k)] += 1

        answer_text = self._answer_text(question)
        board = self.leaderboard()

        await self.send(
            self.host_ws,
            {
                "type": "reveal",
                "correctOptionIds": correct_ids,
                "answerText": answer_text,
                "distribution": distribution,
                "leaderboard": board[:5],
                "isLast": self.q_index >= len(self.questions) - 1,
            },
        )
        for pid, player in self.players.items():
            ans = self.answers.get(pid)
            await self.send(
                player["ws"],
                {
                    "type": "reveal",
                    "correct": bool(ans and ans["correct"]),
                    "delta": ans["award"] if ans else 0,
                    "score": player["score"],
                    "rank": self.player_rank(pid),
                    "streak": player["streak"],
                    "correctOptionIds": correct_ids,
                    "answerText": answer_text,
                },
            )

    def _answer_text(self, question: dict) -> str:
        if question.get("type") == "multiple":
            correct = set(correct_option_ids(question))
            texts = [
                o.get("text", "")
                for o in question.get("options", [])
                if str(o.get("id")) in correct
            ]
            return ", ".join(texts)
        return str(question.get("answer", ""))

    async def end_game(self):
        self.state = "ended"
        board = self.leaderboard()
        await self.send(self.host_ws, {"type": "game_over", "leaderboard": board})
        for pid, player in self.players.items():
            await self.send(
                player["ws"],
                {
                    "type": "game_over",
                    "leaderboard": board[:5],
                    "rank": self.player_rank(pid),
                    "score": player["score"],
                },
            )


def create_room(quiz: dict, host_user_id: int) -> str:
    code = generate_code()
    rooms[code] = GameRoom(code, quiz, host_user_id)
    return code


async def game_ws_handler(websocket: WebSocket, code: str):
    await websocket.accept()
    room = rooms.get(code)
    if room is None:
        await websocket.send_json({"type": "error", "message": "존재하지 않는 방입니다."})
        await websocket.close()
        return

    role = None
    player_id = None
    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")

            if msg_type == "join":
                role = data.get("role")
                if role == "host":
                    room.host_ws = websocket
                    await websocket.send_json(
                        {
                            "type": "joined",
                            "role": "host",
                            "code": code,
                            "quizTitle": room.quiz.get("title", ""),
                            "total": len(room.questions),
                        }
                    )
                    await websocket.send_json(room.lobby_payload())
                else:
                    if room.state != "lobby":
                        await websocket.send_json(
                            {"type": "error", "message": "이미 시작된 게임입니다."}
                        )
                        await websocket.close()
                        return
                    player_id = "p" + "".join(random.choices(string.ascii_lowercase + string.digits, k=8))
                    nickname = (data.get("nickname") or "익명").strip()[:20] or "익명"
                    room.players[player_id] = {
                        "ws": websocket,
                        "nickname": nickname,
                        "score": 0,
                        "streak": 0,
                        "user_id": data.get("userId"),
                    }
                    await websocket.send_json(
                        {
                            "type": "joined",
                            "role": "player",
                            "playerId": player_id,
                            "code": code,
                            "quizTitle": room.quiz.get("title", ""),
                        }
                    )
                    await room.send(room.host_ws, room.lobby_payload())

            elif msg_type == "start" and role == "host":
                async with room.lock:
                    await room.start_game()

            elif msg_type == "next" and role == "host":
                async with room.lock:
                    if room.state == "reveal":
                        await room.next_question()

            elif msg_type == "skip" and role == "host":
                async with room.lock:
                    if room.state == "question":
                        if room.reveal_task and not room.reveal_task.done():
                            room.reveal_task.cancel()
                        await room.reveal()

            elif msg_type == "answer" and role == "player" and player_id:
                async with room.lock:
                    await room.submit_answer(player_id, data.get("value"))

    except WebSocketDisconnect:
        await _handle_disconnect(room, role, player_id, code)
    except Exception:
        await _handle_disconnect(room, role, player_id, code)


async def _handle_disconnect(room: GameRoom, role, player_id, code):
    if role == "host":
        # 호스트가 나가면 방 종료
        await room.broadcast_players({"type": "host_left"})
        if room.reveal_task and not room.reveal_task.done():
            room.reveal_task.cancel()
        rooms.pop(code, None)
    elif role == "player" and player_id:
        room.players.pop(player_id, None)
        room.answers.pop(player_id, None)
        await room.send(room.host_ws, room.lobby_payload())
