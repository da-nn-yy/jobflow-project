import os
import uvicorn

def cli() -> None:
    port = int(os.environ.get("PORT", "4200"))
    uvicorn.run("fieldops.api.app:create_app", factory=True, host="0.0.0.0", port=port)

if __name__ == "__main__":
    cli()
