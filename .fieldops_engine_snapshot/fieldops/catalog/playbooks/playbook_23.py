"""Generated field-service playbook 23."""
from fieldops.domain.models import PlaybookDefinition, TaskDefinition

PLAYBOOK_23 = PlaybookDefinition(
    id="playbook_23",
    name="Regional playbook 23",
    description="Multi-step field workflow for electrical region 7.",
    tasks=[
        TaskDefinition(id="step_0", name="Intake", handler="warranty.validate", timeout_ms=20000),
        TaskDefinition(id="step_1", name="Dispatch", handler="inventory.sync", timeout_ms=25000, depends_on=["step_0"]),
        TaskDefinition(id="step_2", name="Execute", handler="dispatch.assign_technician", timeout_ms=30000, depends_on=["step_1"]),
        TaskDefinition(id="step_3", name="Closeout", handler="parts.ship", timeout_ms=35000, depends_on=["step_2"]),
    ],
    metadata={"region": "7", "vertical": "electrical"},
)
