"""Generated field-service playbook 55."""
from fieldops.domain.models import PlaybookDefinition, TaskDefinition

PLAYBOOK_55 = PlaybookDefinition(
    id="playbook_55",
    name="Regional playbook 55",
    description="Multi-step field workflow for appliance region 7.",
    tasks=[
        TaskDefinition(id="step_0", name="Intake", handler="dispatch.route_optimize", timeout_ms=20000),
        TaskDefinition(id="step_1", name="Dispatch", handler="parts.ship", timeout_ms=25000, depends_on=["step_0"]),
        TaskDefinition(id="step_2", name="Execute", handler="billing.generate_invoice", timeout_ms=30000, depends_on=["step_1"]),
        TaskDefinition(id="step_3", name="Closeout", handler="survey.send", timeout_ms=35000, depends_on=["step_2"]),
    ],
    metadata={"region": "7", "vertical": "appliance"},
)
