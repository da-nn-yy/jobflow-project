"""Generated field-service playbook 29."""
from fieldops.domain.models import PlaybookDefinition, TaskDefinition

PLAYBOOK_29 = PlaybookDefinition(
    id="playbook_29",
    name="Regional playbook 29",
    description="Multi-step field workflow for facilities region 13.",
    tasks=[
        TaskDefinition(id="step_0", name="Intake", handler="dispatch.route_optimize", timeout_ms=20000),
        TaskDefinition(id="step_1", name="Dispatch", handler="parts.ship", timeout_ms=25000, depends_on=["step_0"]),
        TaskDefinition(id="step_2", name="Execute", handler="billing.generate_invoice", timeout_ms=30000, depends_on=["step_1"]),
        TaskDefinition(id="step_3", name="Closeout", handler="survey.send", timeout_ms=35000, depends_on=["step_2"]),
    ],
    metadata={"region": "13", "vertical": "facilities"},
)
