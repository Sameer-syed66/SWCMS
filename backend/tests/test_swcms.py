import pytest
import os
import sys

# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import app


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def test_health_check(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "healthy"
    assert "database" in data


def test_admin_authentication(client):
    res = client.post("/api/auth/login", json={
        "username": "admin",
        "password": "Admin@123",
        "role": "admin"
    })
    assert res.status_code == 200
    data = res.get_json()
    assert "token" in data
    assert data["user"]["role"] == "admin"


def test_authority_authentication(client):
    res = client.post("/api/auth/login", json={
        "username": "authority1",
        "password": "Authority@123",
        "role": "authority"
    })
    assert res.status_code == 200
    data = res.get_json()
    assert "token" in data
    assert data["user"]["role"] == "authority"


def test_invalid_authentication(client):
    res = client.post("/api/auth/login", json={
        "username": "admin",
        "password": "WrongPassword!",
        "role": "admin"
    })
    assert res.status_code == 401


def test_public_citizen_complaint_flow(client):
    # 1. Submit complaint without credentials
    res = client.post("/api/complaints", json={
        "citizen_name": "Test Citizen",
        "citizen_email": "citizen@test.com",
        "category": "Overflowing Garbage",
        "description": "Severe garbage overflow near junction",
        "location": "Central Market"
    })
    assert res.status_code == 201
    complaint_code = res.get_json()["complaint_code"]
    assert complaint_code.startswith("CMP-")

    # 2. Track complaint
    track_res = client.get(f"/api/complaints/track/{complaint_code}")
    assert track_res.status_code == 200
    complaint_data = track_res.get_json()["complaint"]
    assert complaint_data["complaint_code"] == complaint_code
    assert complaint_data["status"] == "PENDING"


def test_waste_monitoring_threshold_alert(client):
    # Simulate high waste level crossing 85% threshold
    res = client.post("/api/waste/simulate", json={
        "bin_id": 2,
        "waste_level": 94.0
    })
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert data["status"] == "FULL"
    assert data["waste_level"] == 94.0


def test_prioritized_collection_queue(client):
    res = client.get("/api/collections/queue")
    assert res.status_code == 200
    queue = res.get_json()["queue"]
    assert len(queue) > 0
    # Queue should be sorted descending by priority score
    assert queue[0]["priority_score"] >= queue[-1]["priority_score"]


def test_collection_completion_record(client):
    res = client.post("/api/collections", json={
        "bin_id": 2,
        "remarks": "Test collection routine"
    })
    assert res.status_code == 201
    data = res.get_json()
    assert data["status"] == "NORMAL"
    assert data["collected_level"] >= 0


def test_report_summary_and_export(client):
    res = client.get("/api/reports/summary")
    assert res.status_code == 200
    data = res.get_json()
    assert "summary" in data
    assert "analytics" in data

    # Export collections CSV
    export_res = client.get("/api/reports/export?type=collections")
    assert export_res.status_code == 200
    assert "text/csv" in export_res.headers.get("Content-Type", "")
