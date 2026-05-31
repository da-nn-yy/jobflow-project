"""Generated field-service playbook 49."""
from fieldops.domain.models import PlaybookDefinition, TaskDefinition

PLAYBOOK_49 = PlaybookDefinition(
    id="playbook_49",
    name="Regional playbook 49",
    description="Multi-step field workflow for facilities region 1.",
    tasks=[
        TaskDefinition(id="step_0", name="Intake", handler="warranty.validate", timeout_ms=20000),
        TaskDefinition(id="step_1", name="Dispatch", handler="inventory.sync", timeout_ms=25000, depends_on=["step_0"]),
        TaskDefinition(id="step_2", name="Execute", handler="dispatch.assign_technician", timeout_ms=30000, depends_on=["step_1"]),
        TaskDefinition(id="step_3", name="Closeout", handler="parts.ship", timeout_ms=35000, depends_on=["step_2"]),
    ],
    metadata={"region": "1", "vertical": "facilities"},
)
