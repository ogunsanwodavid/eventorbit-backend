/* import puppeteer, { Browser } from "puppeteer";

import handlebars from "handlebars";

import { FormattedTicket } from "../../middleware/orders/formatTickets";

class PdfService {
  private browser: Browser | null = null;

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }

  async generateTicketPdf(tickets: FormattedTicket[]): Promise<Buffer> {
    if (!this.browser) {
      await this.initialize();
    }

    const page = await this.browser!.newPage();

    //Compile Handlebars template
    const template = handlebars.compile("../../templates/tickets/ticket.hbs");

    //Generate HTML for all tickets
    const htmlPages = tickets.map((ticket) => template(ticket)).join(`
      <div style="page-break-after: always;"></div>
    `);

    await page.setContent(htmlPages, {
      waitUntil: "networkidle0",
    });

    const pdfData = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "10mm",
        bottom: "10mm",
        left: "0mm",
        right: "0mm",
      },
    });

    //Convert pdf data to buffer
    const pdfBuffer = Buffer.from(pdfData.buffer);

    await page.close();

    return pdfBuffer;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

const pdfService = new PdfService();

export default pdfService;
 */

import puppeteer, { Browser } from "puppeteer";
import handlebars from "handlebars";
import fs from "fs/promises";
import path from "path";
import { FormattedTicket } from "../../middleware/orders/formatTickets";

class PdfService {
  private browser: Browser | null = null;
  private template: handlebars.TemplateDelegate | null = null;

  async initialize() {
    //Initialize browser
    this.browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    //Load and compile template
    const templatePath = path.join(
      __dirname,
      "../../templates/tickets/ticket.hbs"
    );
    const templateContent = await fs.readFile(templatePath, "utf-8");
    this.template = handlebars.compile(templateContent);
  }

  async generateTicketPdf(tickets: FormattedTicket[]): Promise<Buffer> {
    if (!this.browser || !this.template) {
      await this.initialize();
    }

    const page = await this.browser!.newPage();

    //Generate HTML for all tickets
    const htmlPages = tickets.map((ticket) => this.template!(ticket)).join(`
      <div style="page-break-after: always;"></div>
    `);

    await page.setContent(htmlPages, {
      waitUntil: "networkidle0",
    });

    //Generate PDF with dynamic sizing
    const pdfData = await page.pdf({
      width: "260mm",
      height: "500px",
      printBackground: true,
      margin: {
        top: "10mm",
        bottom: "10mm",
        left: "0mm",
        right: "0mm",
      },
    });

    await page.close();
    return Buffer.from(pdfData);
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

const pdfService = new PdfService();

export default pdfService;
