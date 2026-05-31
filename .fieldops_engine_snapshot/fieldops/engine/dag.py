from fieldops.domain.models import TaskDefinition

class DagPlanner:
    def plan_levels(self, tasks: list[TaskDefinition]) -> list[list[str]]:
        indegree = {t.id: len(t.depends_on) for t in tasks}
        by_id = {t.id: t for t in tasks}
        levels: list[list[str]] = []
        ready = [tid for tid, d in indegree.items() if d == 0]
        while ready:
            levels.append(list(ready))
            nxt: list[str] = []
            for tid in ready:
                for t in tasks:
                    if tid in t.depends_on:
                        indegree[t.id] -= 1
                        if indegree[t.id] == 0:
                            nxt.append(t.id)
            ready = nxt
        if sum(indegree.values()) > 0:
            raise ValueError("cycle detected in task graph")
        return levels
