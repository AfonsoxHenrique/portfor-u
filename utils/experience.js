export const sortExperiences = (items) =>
    [...items].sort((a, b) => {
        if (a.currentlyWorkHere !== b.currentlyWorkHere) {
            return a.currentlyWorkHere ? -1 : 1;
        }
        const endCompare = (b.endDate ?? "").localeCompare(a.endDate ?? "");
        if (endCompare !== 0) return endCompare;
        return (b.startDate ?? "").localeCompare(a.startDate ?? "");
    });