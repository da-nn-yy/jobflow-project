from fieldops.notifications.channels import is_valid_channel

def test_channels():
    assert is_valid_channel('sms')
    assert not is_valid_channel('fax')
