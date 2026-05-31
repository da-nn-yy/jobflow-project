"""Generated field-service playbook 60."""
from fieldops.domain.models import PlaybookDefinition, TaskDefinition

PLAYBOOK_60 = PlaybookDefinition(
    id="playbook_60",
    name="Regional playbook 60",
    description="Multi-step field workflow for appliance region 12.",
    tasks=[
        TaskDefinition(id="step_0", name="Intake", handler="billing.generate_invoice", timeout_ms=20000),
        TaskDefinition(id="step_1", name="Dispatch", handler="warranty.validate", timeout_ms=25000, depends_on=["step_0"]),
        TaskDefinition(id="step_2", name="Execute", handler="workorder.intake", timeout_ms=30000, depends_on=["step_1"]),
        TaskDefinition(id="step_3", name="Closeout", handler="dispatch.route_optimize", timeout_ms=35000, depends_on=["step_2"]),
    ],
    metadata={"region": "12", "vertical": "appliance"},
)
