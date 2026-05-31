from fieldops.events.bus import EventBus

def test_event_bus():
    bus = EventBus()
    seen = []
    bus.subscribe('run.completed', lambda e, p: seen.append(p))
    bus.publish('run.completed', {'id': '1'})
    assert seen[0]['id'] == '1'
