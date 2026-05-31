from fieldops.domain.models import PlaybookDefinition
from fieldops.domain.errors import ValidationError

def validate_playbook(pb: PlaybookDefinition, known_handlers: set[str]) -> None:
    if not pb.tasks:
        raise ValidationError("playbook requires at least one task")
    ids = {t.id for t in pb.tasks}
    for task in pb.tasks:
        if task.handler not in known_handlers:
            raise ValidationError(f"unknown handler: {task.handler}")
        for dep in task.depends_on:
            if dep not in ids:
                raise ValidationError(f"unknown dependency: {dep}")
