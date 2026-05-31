"""Generated field-service playbook 68."""
from fieldops.domain.models import PlaybookDefinition, TaskDefinition

PLAYBOOK_68 = PlaybookDefinition(
    id="playbook_68",
    name="Regional playbook 68",
    description="Multi-step field workflow for electrical region 4.",
    tasks=[
        TaskDefinition(id="step_0", name="Intake", handler="dispatch.route_optimize", timeout_ms=20000),
        TaskDefinition(id="step_1", name="Dispatch", handler="parts.ship", timeout_ms=25000, depends_on=["step_0"]),
        TaskDefinition(id="step_2", name="Execute", handler="billing.generate_invoice", timeout_ms=30000, depends_on=["step_1"]),
        TaskDefinition(id="step_3", name="Closeout", handler="survey.send", timeout_ms=35000, depends_on=["step_2"]),
    ],
    metadata={"region": "4", "vertical": "electrical"},
)
