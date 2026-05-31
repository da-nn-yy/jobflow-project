from fieldops.dispatch.optimizer import optimize_route
from fieldops.dispatch.territory import territory_for_zip

def test_optimize_route():
    assert optimize_route([(1,2),(0,1)]) == [1,0]

def test_territory():
    assert territory_for_zip('ZIP-100') == 'north'
