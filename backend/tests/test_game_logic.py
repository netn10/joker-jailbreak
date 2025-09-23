from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


def test_new_game_and_state():
    res = client.post("/api/new-game")
    assert res.status_code == 200
    data = res.json()
    gid = data["game_id"]
    assert isinstance(gid, str)
    res2 = client.get(f"/api/state/{gid}")
    assert res2.status_code == 200
    state = res2.json()
    assert "walls" in state and "corners" in state
    assert state["remainder"] >= 0


def test_draw_to_joker_limit():
    gid = client.post("/api/new-game").json()["game_id"]
    # Draw up to 3
    for _ in range(3):
        res = client.post("/api/draw", json={"game_id": gid})
        assert res.status_code == 200
    state = client.get(f"/api/state/{gid}").json()
    assert len(state["joker_stack"]) == 3
    # Fourth should fail
    res = client.post("/api/draw", json={"game_id": gid})
    assert res.status_code == 400
