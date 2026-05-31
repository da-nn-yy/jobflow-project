from fieldops.handlers.intake import IntakeHandler
from fieldops.handlers.triage import TriageHandler
from fieldops.handlers.assign import AssignTechnicianHandler
from fieldops.handlers.route import RouteOptimizeHandler
from fieldops.handlers.reserve import PartsReserveHandler
from fieldops.handlers.ship import PartsShipHandler
from fieldops.handlers.visit import ExecuteVisitHandler
from fieldops.handlers.signature import CaptureSignatureHandler
from fieldops.handlers.invoice import GenerateInvoiceHandler
from fieldops.handlers.sms import CustomerSmsHandler
from fieldops.handlers.warranty import WarrantyValidateHandler
from fieldops.handlers.survey import SurveySendHandler
from fieldops.handlers.inventory import InventorySyncHandler
from fieldops.handlers.base import TaskHandler
from fieldops.domain.errors import ValidationError

_BUILTIN = [
    IntakeHandler(), TriageHandler(), AssignTechnicianHandler(), RouteOptimizeHandler(),
    PartsReserveHandler(), PartsShipHandler(), ExecuteVisitHandler(), CaptureSignatureHandler(),
    GenerateInvoiceHandler(), CustomerSmsHandler(), WarrantyValidateHandler(),
    SurveySendHandler(), InventorySyncHandler(),
]

class HandlerRegistry:
    def __init__(self) -> None:
        self._handlers = {h.name: h for h in _BUILTIN}

    def get(self, name: str) -> TaskHandler | None:
        return self._handlers.get(name)

    def list_names(self) -> list[str]:
        return sorted(self._handlers.keys())

    def assert_known(self, name: str) -> None:
        if name not in self._handlers:
            raise ValidationError(f"unknown handler: {name}")
