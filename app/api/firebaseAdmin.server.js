// Mock do Firebase para desenvolvimento local
const mockDb = {
  ref: (path) => ({
    once: () => Promise.resolve({ 
      val: () => null,
      exists: () => false
    }),
    set: () => Promise.resolve(),
    push: () => Promise.resolve({ key: 'mock-key' }),
    update: () => Promise.resolve(),
    remove: () => Promise.resolve(),
    on: () => {},
    off: () => {},
    child: (key) => ({
      once: () => Promise.resolve({ 
        val: () => null,
        exists: () => false
      }),
      set: () => Promise.resolve(),
      update: () => Promise.resolve(),
      remove: () => Promise.resolve()
    })
  })
};

export default mockDb;
