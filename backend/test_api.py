"""
Test examples for Respire API endpoints
Run with: pytest test_api.py -v
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

# Test data
TEST_USER = {
    "email": "testuser@example.com",
    "password": "testpass123",
    "first_name": "Test",
    "last_name": "User"
}

TEST_SENSOR = {
    "name": "Test Sensor",
    "type": "temperature",
    "location": "Living Room",
    "user_id": 1
}

class TestHealth:
    def test_health_check(self):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}

    def test_root(self):
        response = client.get("/")
        assert response.status_code == 200
        assert "message" in response.json()


class TestAuth:
    def test_register(self):
        response = client.post(
            "/api/auth/register",
            json=TEST_USER
        )
        assert response.status_code == 200
        assert "access_token" in response.json()
        assert response.json()["token_type"] == "bearer"

    def test_register_duplicate_email(self):
        # Register first user
        client.post("/api/auth/register", json=TEST_USER)
        
        # Try to register with same email
        response = client.post(
            "/api/auth/register",
            json=TEST_USER
        )
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"]

    def test_login(self):
        # Register user first
        client.post("/api/auth/register", json=TEST_USER)
        
        # Login
        response = client.post(
            "/api/auth/login",
            json={
                "email": TEST_USER["email"],
                "password": TEST_USER["password"]
            }
        )
        assert response.status_code == 200
        assert "access_token" in response.json()

    def test_login_invalid_credentials(self):
        response = client.post(
            "/api/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "wrongpass"
            }
        )
        assert response.status_code == 401


class TestUsers:
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test user and token"""
        reg_response = client.post("/api/auth/register", json=TEST_USER)
        self.token = reg_response.json()["access_token"]
        self.user_id = reg_response.json()["user_id"]
        self.headers = {"Authorization": f"Bearer {self.token}"}

    def test_list_users(self):
        response = client.get("/api/users")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_get_user(self):
        response = client.get(f"/api/users/{self.user_id}")
        assert response.status_code == 200
        assert response.json()["email"] == TEST_USER["email"]

    def test_update_user(self):
        response = client.put(
            f"/api/users/{self.user_id}",
            json={"first_name": "Updated"},
            headers=self.headers
        )
        assert response.status_code == 200
        assert response.json()["first_name"] == "Updated"


class TestProfil:
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test user and token"""
        reg_response = client.post("/api/auth/register", json=TEST_USER)
        self.token = reg_response.json()["access_token"]
        self.user_id = reg_response.json()["user_id"]
        self.headers = {"Authorization": f"Bearer {self.token}"}

    def test_get_profil(self):
        response = client.get(f"/api/users/{self.user_id}/profil")
        assert response.status_code == 200
        assert "id" in response.json()

    def test_update_profil(self):
        response = client.put(
            f"/api/users/{self.user_id}/profil",
            json={
                "bio": "Test bio",
                "avatar_url": "https://example.com/avatar.jpg"
            },
            headers=self.headers
        )
        assert response.status_code == 200
        assert response.json()["bio"] == "Test bio"


class TestCohortes:
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test user and token"""
        reg_response = client.post("/api/auth/register", json=TEST_USER)
        self.token = reg_response.json()["access_token"]
        self.user_id = reg_response.json()["user_id"]
        self.headers = {"Authorization": f"Bearer {self.token}"}

    def test_create_cohorte(self):
        response = client.post(
            "/api/cohortes",
            json={
                "name": "Test Cohorte",
                "description": "A test cohorte"
            },
            headers=self.headers
        )
        assert response.status_code == 200
        assert response.json()["name"] == "Test Cohorte"

    def test_list_cohortes(self):
        response = client.get("/api/cohortes")
        assert response.status_code == 200
        assert isinstance(response.json(), list)


class TestCapteurs:
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test user and token"""
        reg_response = client.post("/api/auth/register", json=TEST_USER)
        self.token = reg_response.json()["access_token"]
        self.user_id = reg_response.json()["user_id"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
        
        # Create sensor
        sensor_data = {
            "name": "Test Sensor",
            "type": "temperature",
            "location": "Room",
            "user_id": self.user_id
        }
        sensor_response = client.post(
            "/api/capteurs",
            json=sensor_data,
            headers=self.headers
        )
        self.sensor_id = sensor_response.json()["id"]

    def test_create_capteur(self):
        response = client.post(
            "/api/capteurs",
            json={
                "name": "Another Sensor",
                "type": "humidity",
                "user_id": self.user_id
            },
            headers=self.headers
        )
        assert response.status_code == 200

    def test_list_capteurs(self):
        response = client.get(
            "/api/capteurs",
            headers=self.headers
        )
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_get_capteur(self):
        response = client.get(
            f"/api/capteurs/{self.sensor_id}",
            headers=self.headers
        )
        assert response.status_code == 200

    def test_get_capteur_status(self):
        response = client.get(
            f"/api/capteurs/{self.sensor_id}/status",
            headers=self.headers
        )
        assert response.status_code == 200


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
