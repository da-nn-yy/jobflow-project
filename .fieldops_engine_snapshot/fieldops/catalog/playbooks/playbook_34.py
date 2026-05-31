"""Generated field-service playbook 34."""
from fieldops.domain.models import PlaybookDefinition, TaskDefinition

PLAYBOOK_34 = PlaybookDefinition(
    id="playbook_34",
    name="Regional playbook 34",
    description="Multi-step field workflow for facilities region 2.",
    tasks=[
        TaskDefinition(id="step_0", name="Intake", handler="billing.generate_invoice", timeout_ms=20000),
        TaskDefinition(id="step_1", name="Dispatch", handler="warranty.validate", timeout_ms=25000, depends_on=["step_0"]),
        TaskDefinition(id="step_2", name="Execute", handler="workorder.intake", timeout_ms=30000, depends_on=["step_1"]),
        TaskDefinition(id="step_3", name="Closeout", handler="dispatch.route_optimize", timeout_ms=35000, depends_on=["step_2"]),
    ],
    metadata={"region": "2", "vertical": "facilities"},
)
