const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  console.log("Loading...");
  // Launch a new browser instance
  const browser = await puppeteer.launch();
  // Create a new page
  const page = await browser.newPage();

  // Navigate to the desired URL
  const url = fs.readFileSync("url.txt", "utf8").trim();
  console.log("Processing URL: ", url);

  await page.goto(url, { waitUntil: "networkidle2" });

//   await page.screenshot({ path: `./screenshot.png`, fullPage: true });

  // Extract data from the page
  const influencers = [
    {
      title: "Title",
      category: "Category",
      country: "Country",
      followers: "Followers",
      engRate: "Eng. Rate",
      type: "Type",
    },
  ];

  const extractTextContent = async (element) => {
    if (element === null) {
      return "--";
    }
    const textContent = await page.evaluate(
      (title) => title.textContent.trim(),
      element
    );

    return textContent;
  };

  // Iterate through each tr element
  for (let i = 1; ; i++) {
    // Construct the CSS selector dynamically
    const titleSelector = `#__layout > div > div.section-1 > div.container-md.d-none.d-lg-block > div > div.col-9 > div.table > table > tbody > tr:nth-child(${i}) > td:nth-child(2) > div > a.block-title`;

    const categorySelector = `#__layout > div > div.section-1 > div.container-md.d-none.d-lg-block > div > div.col-9 > div.table > table > tbody > tr:nth-child(${i}) > td:nth-child(3) > div > a`;

    const countrySelector = `#__layout > div > div.section-1 > div.container-md.d-none.d-lg-block > div > div.col-9 > div.table > table > tbody > tr:nth-child(${i}) > td:nth-child(4) > div > p`;

    const followersSelector = `#__layout > div > div.section-1 > div.container-md.d-none.d-lg-block > div > div.col-9 > div.table > table > tbody > tr:nth-child(${i}) > td:nth-child(5) > p`;

    const engRateSelector = `#__layout > div > div.section-1 > div.container-md.d-none.d-lg-block > div > div.col-9 > div.table > table > tbody > tr:nth-child(${i}) > td:nth-child(6) > p > span`;

    const typeSelector = `#__layout > div > div.section-1 > div.container-md.d-none.d-lg-block > div > div.col-9 > div.table > table > tbody > tr:nth-child(${i}) > td:nth-child(2) > div > a.block-subTitle`;

    // Select the element using the CSS selector
    const titleElement = await page.$(titleSelector);
    const categoryElement = await page.$(categorySelector);
    const countryElement = await page.$(countrySelector);
    const followersElement = await page.$(followersSelector);
    const engRateElement = await page.$(engRateSelector);
    const typeElement = await page.$(typeSelector);
    // If no element is found, break out of the loop
    if (!titleElement) break;
    // Get the text content of the element
    const title = await extractTextContent(titleElement);
    const category = await extractTextContent(categoryElement);
    const country = await extractTextContent(countryElement);
    const followers = await extractTextContent(followersElement);
    const engRate = await extractTextContent(engRateElement);
    const type = await extractTextContent(typeElement);

    // Push the text content into the array
    influencers.push({
      title: title.replace(/,/g, ""),
      category: category.replace(/,/g, ""),
      country: country.replace(/,/g, ""),
      followers: parseInt(followers.replace(/,/g, "")),
      engRate: parseFloat(engRate.replace(/,/g, "")),
      type: type.replace(/,/g, ""),
    });
  }

  const excelContent = influencers.map((influencer) =>
    Object.values(influencer).join(",")
  );

  // Check if the file already exists
  let filename = "influencers.csv";
  let counter = 1;
  while (fs.existsSync(filename)) {
    filename = `influencers_${counter}.csv`;
    counter++;
  }

  // Write the Excel content to a new file
  fs.writeFileSync(filename, "\uFEFF" + excelContent.join("\n"));

  console.log(`Influencers data saved to ${filename}`);

  // Close the browser
  await browser.close();
})();
