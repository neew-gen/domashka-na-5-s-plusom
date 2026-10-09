from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


def test_hash_and_verify_password():
    hashed = hash_password("secret12")
    assert hashed != "secret12"
    assert verify_password("secret12", hashed)
    assert not verify_password("wrong", hashed)


def test_access_token_roundtrip():
    token = create_access_token("42")
    assert decode_access_token(token) == "42"


def test_decode_invalid_token():
    assert decode_access_token("not-a-token") is None
