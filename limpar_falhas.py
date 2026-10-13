import requests

BASE = "https://network-twin-backend.onrender.com/api"

r = requests.post(f"{BASE}/auth/login", json={"email": "marcelo@martins", "password": "Lacoste123"})
print("Login status:", r.status_code)

data = r.json()
token = data.get("accessToken") or data.get("access_token") or data.get("token")
if not token:
    print("ERRO:", data)
    exit(1)

headers = {"Authorization": f"Bearer {token}"}
print("Autenticado.")

falhas = requests.get(f"{BASE}/failures", headers=headers).json()
ativas = [f for f in falhas if f.get("status") != "RESTORED"]
print(f"{len(ativas)} falha(s) ativa(s).")

for f in ativas:
    resp = requests.patch(f"{BASE}/failures/{f['id']}/restore", headers=headers)
    status = "OK" if resp.status_code < 300 else f"ERRO {resp.status_code}"
    print(f"  {f['id'][:8]}... ({f.get('type','?')}) → {status}")

print("Concluído.")
