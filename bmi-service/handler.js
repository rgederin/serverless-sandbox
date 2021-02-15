'use strict';

module.exports.bmi = (event, context, callback) => {
  console.log(event);

  let weight, height;

  if (event.weight && event.height) {
    weight = event.weight;
    height = event.height;
  } else {
    const requestBody = JSON.parse(event.body);
    height = requestBody.height;
    weight = requestBody.weight;
  }

  console.log("height: " + height + "KG, weight: " + weight + "M");

  const response = calculateBmi(height, weight);

  callback(null, {
    statusCode: 200,
    body: JSON.stringify(response)
  });
};

const calculateBmi = (height, weight) => {
  const bmi = (weight / (height * height)).toFixed(2);

  let index;

  if (bmi < 18.5) {
    index = "under weight";
  }

  else if (bmi >= 18.5 && bmi <= 24.9) {
    index = "normal weight";
  }

  else if (bmi > 24.9 && bmi <= 29.9) {
    index = "over weight";
  }
  else {
    index = "obesity";
  }

  return {
    bmi: bmi,
    result: index
  }
}
