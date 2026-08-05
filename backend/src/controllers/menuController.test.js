const { getTonightMenu } = require('./menuController');
const MenuItem = require('../models/MenuItem');

jest.mock('../models/MenuItem');

describe('menuController - getTonightMenu', () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      query: {},
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  test('should return breakfast menu for a breakfast reservation time (e.g. 09:00)', async () => {
    req.query.time = '09:00';
    MenuItem.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([{ name: 'Eggs Benedict', category: 'breakfast' }])
    });

    await getTonightMenu(req, res);

    expect(MenuItem.find).toHaveBeenCalledWith(expect.objectContaining({
      category: { $in: ['breakfast'] }
    }));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      categories: ['breakfast']
    }));
  });

  test('should return lunch menu for a lunch reservation time (e.g. 13:00)', async () => {
    req.query.time = '13:00';
    MenuItem.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([{ name: 'Salad', category: 'lunch' }])
    });

    await getTonightMenu(req, res);

    expect(MenuItem.find).toHaveBeenCalledWith(expect.objectContaining({
      category: { $in: ['lunch'] }
    }));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      categories: ['lunch']
    }));
  });

  test('should return dinner, desserts, and drinks menu for a dinner reservation time (e.g. 20:00)', async () => {
    req.query.time = '20:00';
    MenuItem.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([{ name: 'Steak', category: 'dinner' }])
    });

    await getTonightMenu(req, res);

    expect(MenuItem.find).toHaveBeenCalledWith(expect.objectContaining({
      category: { $in: ['dinner', 'desserts', 'drinks'] }
    }));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      categories: ['dinner', 'desserts', 'drinks']
    }));
  });

  test('should handle different reservation dates but respect the reservation time', async () => {
    req.query.date = '2026-07-31';
    req.query.time = '08:30';
    MenuItem.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([{ name: 'Pancakes', category: 'breakfast' }])
    });

    await getTonightMenu(req, res);

    expect(MenuItem.find).toHaveBeenCalledWith(expect.objectContaining({
      category: { $in: ['breakfast'] }
    }));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      categories: ['breakfast']
    }));
  });

  test('should fallback to current server time if reservation time is missing', async () => {
    MenuItem.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([{ name: 'Default Dish' }])
    });

    await getTonightMenu(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true
    }));
  });

  test('should handle invalid reservation time parameters gracefully by falling back', async () => {
    req.query.time = 'invalid-time';
    MenuItem.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([{ name: 'Default Dish' }])
    });

    await getTonightMenu(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true
    }));
  });
});
