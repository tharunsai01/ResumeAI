// Counterfactual fairness tests: the SAME resume with only identity details changed.
// The scores of the two versions should not differ. Names are test fixtures and can be edited.

export const NAME_PAIRS = [
    { id: "gender-coded-names", label: "Male-coded vs female-coded first name (same surname)", a: "Aarav Sharma", b: "Aadhya Sharma" },
    { id: "community-coded-names", label: "Names associated with different communities", a: "Amit Verma", b: "Imran Khan" },
  ];
  export const ALTERNATIVE_LOCATION = "Bhopal, India";
  export const ALTERNATIVE_INSTITUTION = "Regional Institute of Technology";
  export const ALTERNATIVE_COMPANY = "Globex Corporation";
  export const EDUCATION_YEAR_SHIFT = -6; // makes the candidate look about six years older
  
  const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const replaceAll = (text, from, to) => (from ? text.replace(new RegExp(escapeRegex(from), "gi"), to) : text);
  
  export function swapName(text, candidate, newName) {
    let out = replaceAll(text, candidate.name, newName);
    if (candidate.email) {
      const local = newName.toLowerCase().replace(/\s+/g, ".");
      out = replaceAll(out, candidate.email, `${local}@example.com`);
    }
    return out;
  }
  
  function swapOrganisations(text, names, replacement) {
    let out = text;
    for (const name of names.filter(Boolean)) out = replaceAll(out, name, replacement);
    return out;
  }
  
  function shiftEducationYears(text, analysis, delta) {
    const markers = analysis.education.flatMap((item) => [item.degree, item.institution]).filter(Boolean);
    const years = new Set(
      analysis.education.flatMap((item) => [item.duration.match(/\d{4}/g) ?? []].flat())
    );
    return text
      .split("\n")
      .map((line) => {
        if (!markers.some((marker) => line.includes(marker))) return line;
        return line.replace(/\b(19|20)\d{2}\b/g, (year) => (years.has(year) ? String(Number(year) + delta) : year));
      })
      .join("\n");
  }
  
  /**
   * Builds the fairness variants that apply to this resume.
   * Returns [{ id, group, label, textA, textB }]; variants whose details are not in the text are skipped.
   */
  export function buildVariants(text, analysis) {
    const candidate = analysis.candidate;
    const variants = [];
  
    for (const pair of NAME_PAIRS) {
      variants.push({
        id: pair.id,
        group: "Name",
        label: pair.label,
        textA: swapName(text, candidate, pair.a),
        textB: swapName(text, candidate, pair.b),
      });
    }
    variants.push({
      id: "location",
      group: "Location",
      label: "Metro city vs smaller town",
      textA: text,
      textB: replaceAll(text, candidate.location, ALTERNATIVE_LOCATION),
    });
    variants.push({
      id: "institution",
      group: "Institution",
      label: "Original institution vs a little-known institution",
      textA: text,
      textB: swapOrganisations(text, analysis.education.map((item) => item.institution), ALTERNATIVE_INSTITUTION),
    });
    variants.push({
      id: "company",
      group: "Company",
      label: "Original employers vs a different company name",
      textA: text,
      textB: swapOrganisations(text, analysis.experience.map((role) => role.company), ALTERNATIVE_COMPANY),
    });
    variants.push({
      id: "education-dates",
      group: "Age proxy",
      label: "Education dates six years earlier (same experience)",
      textA: text,
      textB: shiftEducationYears(text, analysis, EDUCATION_YEAR_SHIFT),
    });
  
    return variants.filter((variant) => variant.textA !== variant.textB);
  }