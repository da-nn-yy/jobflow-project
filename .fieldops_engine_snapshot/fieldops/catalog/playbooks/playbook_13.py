"""Generated field-service playbook 13."""
from fieldops.domain.models import PlaybookDefinition, TaskDefinition

PLAYBOOK_13 = PlaybookDefinition(
    id="playbook_13",
    name="Regional playbook 13",
    description="Multi-step field workflow for electrical region 13.",
    tasks=[
        TaskDefinition(id="step_0", name="Intake", handler="workorder.intake", timeout_ms=20000),
        TaskDefinition(id="step_1", name="Dispatch", handler="dispatch.assign_technician", timeout_ms=25000, depends_on=["step_0"]),
        TaskDefinition(id="step_2", name="Execute", handler="parts.ship", timeout_ms=30000, depends_on=["step_1"]),
        TaskDefinition(id="step_3", name="Closeout", handler="billing.generate_invoice", timeout_ms=35000, depends_on=["step_2"]),
    ],
    metadata={"region": "13", "vertical": "electrical"},
)
