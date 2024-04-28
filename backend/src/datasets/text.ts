function solvePrompt(
  dataset: {
    transcript: string;
    show: string;
    season: string;
    episode: string;
    title: string;
    SOURCE: string;
  }[]
): string {
  let mostFrequentShow = dataset.reduce((acc, curr) => {
    acc[curr.show] = (acc[curr.show] || 0) + 1;
    return acc;
  }, {});

  let maxCount = 0;
  let bestShow = "";

  for (const show in mostFrequentShow) {
    if (mostFrequentShow[show] > maxCount) {
      maxCount = mostFrequentShow[show];
      bestShow = show;
    }
  }

  console.log(bestShow);
  return bestShow;
}

const dataset = JSON.parse("[]");
solvePrompt(dataset);
