let currentRepository = null;

export function getCurrentRepository() {
    return currentRepository;
}

export function setCurrentRepository(repository) {
    currentRepository = repository;
}

export function clearCurrentRepository() {
    currentRepository = null;
}