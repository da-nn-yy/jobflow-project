"""Generated field-service playbook 58."""
from fieldops.domain.models import PlaybookDefinition, TaskDefinition

PLAYBOOK_58 = PlaybookDefinition(
    id="playbook_58",
    name="Regional playbook 58",
    description="Multi-step field workflow for electrical region 10.",
    tasks=[
        TaskDefinition(id="step_0", name="Intake", handler="field.execute_visit", timeout_ms=20000),
        TaskDefinition(id="step_1", name="Dispatch", handler="billing.generate_invoice", timeout_ms=25000, depends_on=["step_0"]),
        TaskDefinition(id="step_2", name="Execute", handler="survey.send", timeout_ms=30000, depends_on=["step_1"]),
        TaskDefinition(id="step_3", name="Closeout", handler="workorder.triage", timeout_ms=35000, depends_on=["step_2"]),
    ],
    metadata={"region": "10", "vertical": "electrical"},
)
