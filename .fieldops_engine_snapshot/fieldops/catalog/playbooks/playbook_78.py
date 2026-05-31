"""Generated field-service playbook 78."""
from fieldops.domain.models import PlaybookDefinition, TaskDefinition

PLAYBOOK_78 = PlaybookDefinition(
    id="playbook_78",
    name="Regional playbook 78",
    description="Multi-step field workflow for electrical region 14.",
    tasks=[
        TaskDefinition(id="step_0", name="Intake", handler="workorder.intake", timeout_ms=20000),
        TaskDefinition(id="step_1", name="Dispatch", handler="dispatch.assign_technician", timeout_ms=25000, depends_on=["step_0"]),
        TaskDefinition(id="step_2", name="Execute", handler="parts.ship", timeout_ms=30000, depends_on=["step_1"]),
        TaskDefinition(id="step_3", name="Closeout", handler="billing.generate_invoice", timeout_ms=35000, depends_on=["step_2"]),
    ],
    metadata={"region": "14", "vertical": "electrical"},
)
