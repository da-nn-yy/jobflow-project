"""Generated field-service playbook 24."""
from fieldops.domain.models import PlaybookDefinition, TaskDefinition

PLAYBOOK_24 = PlaybookDefinition(
    id="playbook_24",
    name="Regional playbook 24",
    description="Multi-step field workflow for facilities region 8.",
    tasks=[
        TaskDefinition(id="step_0", name="Intake", handler="survey.send", timeout_ms=20000),
        TaskDefinition(id="step_1", name="Dispatch", handler="workorder.intake", timeout_ms=25000, depends_on=["step_0"]),
        TaskDefinition(id="step_2", name="Execute", handler="dispatch.route_optimize", timeout_ms=30000, depends_on=["step_1"]),
        TaskDefinition(id="step_3", name="Closeout", handler="field.execute_visit", timeout_ms=35000, depends_on=["step_2"]),
    ],
    metadata={"region": "8", "vertical": "facilities"},
)
