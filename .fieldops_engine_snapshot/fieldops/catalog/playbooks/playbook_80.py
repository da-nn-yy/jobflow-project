"""Generated field-service playbook 80."""
from fieldops.domain.models import PlaybookDefinition, TaskDefinition

PLAYBOOK_80 = PlaybookDefinition(
    id="playbook_80",
    name="Regional playbook 80",
    description="Multi-step field workflow for appliance region 16.",
    tasks=[
        TaskDefinition(id="step_0", name="Intake", handler="dispatch.assign_technician", timeout_ms=20000),
        TaskDefinition(id="step_1", name="Dispatch", handler="parts.reserve", timeout_ms=25000, depends_on=["step_0"]),
        TaskDefinition(id="step_2", name="Execute", handler="field.capture_signature", timeout_ms=30000, depends_on=["step_1"]),
        TaskDefinition(id="step_3", name="Closeout", handler="warranty.validate", timeout_ms=35000, depends_on=["step_2"]),
    ],
    metadata={"region": "16", "vertical": "appliance"},
)
