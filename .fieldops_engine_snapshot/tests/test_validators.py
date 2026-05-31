import pytest
from fieldops.domain.models import PlaybookDefinition, TaskDefinition
from fieldops.validators.playbook_validator import validate_playbook
from fieldops.validators.schedule_validator import validate_cron
from fieldops.domain.errors import ValidationError

def test_validate_playbook():
    pb = PlaybookDefinition(id='p1', name='n', tasks=[TaskDefinition(id='t1', name='T', handler='workorder.intake')])
    validate_playbook(pb, {'workorder.intake'})

def test_validate_cron():
    assert validate_cron('0 9 * * 1')

def test_unknown_handler():
    pb = PlaybookDefinition(id='p1', name='n', tasks=[TaskDefinition(id='t1', name='T', handler='missing')])
    with pytest.raises(ValidationError):
        validate_playbook(pb, {'workorder.intake'})
