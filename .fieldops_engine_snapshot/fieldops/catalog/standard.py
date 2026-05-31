from fieldops.domain.models import PlaybookDefinition, TaskDefinition

STANDARD_PLAYBOOKS: list[PlaybookDefinition] = [
    PlaybookDefinition(
        id="hvac_emergency",
        name="HVAC emergency dispatch",
        description="Priority HVAC breakdown response with parts and billing",
        tasks=[
            TaskDefinition(id="intake", name="Intake", handler="workorder.intake", timeout_ms=15000),
            TaskDefinition(id="triage", name="Triage", handler="workorder.triage", timeout_ms=10000, depends_on=["intake"]),
            TaskDefinition(id="assign", name="Assign tech", handler="dispatch.assign_technician", timeout_ms=20000, depends_on=["triage"]),
            TaskDefinition(id="visit", name="Field visit", handler="field.execute_visit", timeout_ms=3600000, depends_on=["assign"]),
            TaskDefinition(id="sign", name="Signature", handler="field.capture_signature", timeout_ms=5000, depends_on=["visit"]),
            TaskDefinition(id="bill", name="Invoice", handler="billing.generate_invoice", timeout_ms=15000, depends_on=["sign"]),
            TaskDefinition(id="sms", name="Notify", handler="notify.customer_sms", timeout_ms=8000, depends_on=["bill"], optional=True),
        ],
        metadata={"trade": "hvac", "priority": "emergency"},
    ),
    PlaybookDefinition(
        id="plumbing_standard",
        name="Plumbing standard work order",
        tasks=[
            TaskDefinition(id="intake", name="Intake", handler="workorder.intake", timeout_ms=15000),
            TaskDefinition(id="reserve", name="Reserve parts", handler="parts.reserve", timeout_ms=20000, depends_on=["intake"]),
            TaskDefinition(id="ship", name="Ship parts", handler="parts.ship", timeout_ms=30000, depends_on=["reserve"]),
            TaskDefinition(id="assign", name="Assign", handler="dispatch.assign_technician", timeout_ms=20000, depends_on=["intake"]),
            TaskDefinition(id="route", name="Route", handler="dispatch.route_optimize", timeout_ms=15000, depends_on=["assign"]),
        ],
        metadata={"trade": "plumbing"},
    ),
]

async def seed_standard(store) -> int:
    for pb in STANDARD_PLAYBOOKS:
        await store.save(pb)
    return len(STANDARD_PLAYBOOKS)
