"""Generated field-service playbook 19."""
from fieldops.domain.models import PlaybookDefinition, TaskDefinition

PLAYBOOK_19 = PlaybookDefinition(
    id="playbook_19",
    name="Regional playbook 19",
    description="Multi-step field workflow for facilities region 3.",
    tasks=[
        TaskDefinition(id="step_0", name="Intake", handler="field.execute_visit", timeout_ms=20000),
        TaskDefinition(id="step_1", name="Dispatch", handler="billing.generate_invoice", timeout_ms=25000, depends_on=["step_0"]),
        TaskDefinition(id="step_2", name="Execute", handler="survey.send", timeout_ms=30000, depends_on=["step_1"]),
        TaskDefinition(id="step_3", name="Closeout", handler="workorder.triage", timeout_ms=35000, depends_on=["step_2"]),
    ],
    metadata={"region": "3", "vertical": "facilities"},
)
