def build_summary(total_runs: int, completed: int, failed: int) -> dict:
    return {"total_runs": total_runs, "completed": completed, "failed": failed,
            "success_rate": round(completed / total_runs, 4) if total_runs else 0.0}
