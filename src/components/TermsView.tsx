export default function TermsView() {
  const sections = [
    {
      n: 1,
      title: "Acceptance of Terms",
      body: 'By accessing or using ConvertOneAI (the "Service"), you agree to be bound by these Terms and our Privacy Policy. If you do not agree with any part of these terms, you are not permitted to access or use our file conversion services. Your continued use of the Service constitutes your ongoing acceptance of these Terms.',
    },
    {
      n: 2,
      title: "Description of Service",
      body: "ConvertOneAI provides a smart, web-based utility that extracts content from PDF and Word (.docx) documents and converts them into clean, standardized Markdown format. While we aim to provide high-quality structural translations of tables, headers, and formatted lists, our conversion processes depend heavily on the source document formatting. The Service handles files up to a generous 50MB file restriction, but may contain functional limitations when processing heavily nested formats or low-resolution scanned pages.",
    },
    {
      n: 3,
      title: "Acceptable Use",
      body: "You are free to use our Service for both personal and professional conversions. However, you agree to use ConvertOneAI only for lawful operations. Specifically, you agree not to:",
      bullets: [
        "Attempt to disrupt or compromise our server performance, API endpoints, or security configurations.",
        "Upload, transmit, or process files containing malicious code, viruses, malware, or Trojan horses.",
        "Convert any content that violates third-party intellectual property, privacy rights, or local and international regulations.",
        "Use automated scrapers, bots, or script sequences to abuse or strain the conversion platform.",
      ],
    },
    {
      n: 4,
      title: "File Handling",
      body: "Your data privacy and digital trust are of the utmost importance. Under our volatile processing design, all uploaded documents are processed securely in temporary RAM memory solely during the active conversion transaction. No files are preserved, cached, stored, or distributed on our servers once your Markdown output is compiled. All input files are immediately and permanently cleared from volatile memory upon completion.",
    },
    {
      n: 5,
      title: "Intellectual Property",
      body: "We respect your creative output and ownership rights:",
      bullets: [
        "Your Files and Output: You retain absolute, full ownership of all source files uploaded and all resulting Markdown materials compiled by the Service.",
        "Our Platform Rights: The software, UI, logos, and trademark 'ConvertOneAI' remain the exclusive property of ConvertOneAI. You are granted a limited, non-transferable license to access our platform for conversion purposes only.",
      ],
    },
    {
      n: 6,
      title: "Disclaimer of Warranties",
      body: 'ConvertOneAI is provided strictly on an "as-is" and "as-available" basis without representations of any kind, whether express or implied. We disclaim all implied warranties of merchantability, fitness for a specific purpose, and non-infringement.',
    },
    {
      n: 7,
      title: "Limitation of Liability",
      body: "To the maximum extent permitted by applicable laws, in no event shall ConvertOneAI, its developers, or its affiliates be held liable for any damages, metadata discrepancies, data loss, or conversion errors arising from your use of or inability to use this Service. Users are encouraged to maintain independent backups of critical files.",
    },
    {
      n: 8,
      title: "Changes to Terms",
      body: 'We reserve the right to review and update these Terms at any time to reflect software upgrades, regulatory shifts, or operational updates. When revisions occur, we will adjust the "Effective Date" at the top of this page. Your continued access to the platform following updates signifies your clear agreement to the revised Terms.',
    },
    {
      n: 9,
      title: "Governing Law",
      body: "These Terms and all disputes arising from your use of ConvertOneAI shall be governed by, and interpreted in accordance with, the laws of the State of California, United States, without regard to its conflict of law principles.",
    },
    {
      n: 10,
      title: "Contact Us",
      body: "If you have questions, concerns, or feedback regarding these Terms, please reach out to us via the Contact Support form available in the navigation menu.",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto text-left font-sans space-y-6 leading-relaxed text-sm text-[#6B6459] bg-[#FAF8F3] p-8 md:p-12 rounded-xl border border-[#E4E0D8] shadow-xs">
      <div className="border-b border-[#E4E0D8] pb-5">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2F6F5E] block mb-1">Legal</span>
        <h1 className="text-3xl font-bold font-display text-[#171B26] tracking-tight">Terms of Service</h1>
        <p className="text-xs text-[#6B6459]/70 select-none mt-1">Effective Date: June 22, 2026</p>
      </div>

      <p className="text-[#6B6459] font-medium">
        Welcome to ConvertOneAI. Please read these Terms of Service carefully before using our website and services.
      </p>

      <div className="space-y-6 font-sans">
        {sections.map(({ n, title, body, bullets }) => (
          <section key={n} className="space-y-2">
            <h3 className="text-base font-bold text-[#171B26] tracking-tight flex items-center gap-2">
              <span className="text-[#2F6F5E] font-mono">{n}.</span> {title}
            </h3>
            <p className="text-[#6B6459] text-xs md:text-sm">{body}</p>
            {bullets && (
              <ul className="list-disc pl-5 text-[#6B6459] text-xs md:text-sm space-y-1">
                {bullets.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
