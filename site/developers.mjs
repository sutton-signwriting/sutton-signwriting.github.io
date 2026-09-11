// One catalog supplies both the human page and the downloadable tool index.
export function resolveToolCatalog(source, packages) {
  return {
    ...source,
    tools: source.tools.map(tool => {
      if (!tool.npmPackage) return tool;
      const pkg = packages.find(item => item.name === tool.npmPackage);
      if (!pkg) throw new Error(`Missing release snapshot: ${tool.npmPackage}`);
      return {
        ...tool, package: pkg.name, version: pkg.version, checked: pkg.checked,
        registry: pkg.registry, unpackedSize: pkg.unpackedSize,
        distribution: `https://www.npmjs.com/package/${pkg.name}/v/${pkg.version}`,
        pinnedFiles: `https://unpkg.com/browse/${pkg.name}@${pkg.version}/`,
        install: `npm install ${pkg.name}@${pkg.version}`
      };
    })
  };
}

export function developerPage(catalog, {esc, link, code, heading}) {
  const toolRow = tool => `<article class="tool-row" id="${esc(tool.id)}">
    <div class="tool-identity">
      <p class="tool-owner">${esc(tool.owner)}</p>
      <h3>${esc(tool.name)}</h3>
      ${tool.package ? `<p class="package-name">${esc(tool.package)}</p>` : ''}
      <p class="tool-release">${tool.version ? `<span class="version">${esc(tool.version)}</span> ` : ''}${esc(tool.status)}</p>
      <ul class="tool-tags" aria-label="Environments">${tool.environments.map(env => `<li>${esc(env)}</li>`).join('')}</ul>
    </div>
    <div class="tool-detail">
      <p>${esc(tool.summary)}</p>
      <p class="small">${tool.capabilities.map(esc).join(' · ')}</p>
      <div class="link-list">
        ${tool.demo ? link(tool.demo, 'Open editor') : ''}
        ${link(tool.documentation, 'Documentation')}
        ${link(tool.repository, 'Source')}
        ${tool.distribution ? link(tool.distribution, 'Package') : ''}
        ${(tool.extraLinks || []).map(item => link(item.url, item.label)).join('')}
      </div>
      ${tool.install ? `<details class="tool-install"><summary>Install${tool.version ? ' version '+esc(tool.version) : ''}</summary>
        ${code(tool.id === 'core' ? 'install' : 'install-'+tool.id, tool.install)}
        ${tool.requirements ? `<p class="small">${esc(tool.requirements)}</p>` : ''}
        ${tool.pinnedFiles ? `<p class="small">${link(tool.pinnedFiles, 'Pinned package files')} · ${(tool.unpackedSize/1024/1024).toFixed(1)} MiB unpacked; downloads vary by file.</p>` : ''}
      </details>` : ''}
      ${tool.note ? `<p class="small tool-note">${esc(tool.note)}</p>` : ''}
    </div>
  </article>`;

  const groups = catalog.groups.map(group => `<section class="tool-environment" id="${esc(group.id)}" aria-labelledby="${esc(group.id)}-heading">
    <div class="environment-heading"><p class="eyebrow">${esc(group.subtitle)}</p><h2 id="${esc(group.id)}-heading">${esc(group.title)}</h2><p>${esc(group.description)}</p></div>
    <div class="tool-list">${catalog.tools.filter(tool => tool.group === group.id).map(toolRow).join('')}</div>
  </section>`).join('');

  const ext = catalog.communityExtension;
  return heading('Developer tools', 'Build with SignWriting.', 'Find the libraries and tools for your environment—from text processing and rendering to editors and machine learning.') + `
    <div class="shell developer-intro">
      <nav class="environment-jumps" aria-label="Choose a development environment">
        ${catalog.groups.map(group => `<a href="#${esc(group.id)}">${group.id === 'external' ? 'External tools & ML' : esc(group.title)} <span aria-hidden="true">↓</span></a>`).join('')}
      </nav>
      <p class="small catalog-links"><a href="#community-extensions">Community extension proposal</a> · <a href="/tools.json" download>Download the tool catalog (JSON)</a> · Checked ${esc(catalog.checked)}</p>
    </div>
    <section class="shell extension-feature" id="community-extensions" aria-labelledby="extensions-heading">
      <div>
        <p class="eyebrow">Community contribution · ${esc(ext.owner)}</p>
        <h2 id="extensions-heading">Explore the proposed extension functions.</h2>
        <p>${esc(ext.summary)}</p>
        <div class="link-list">${link(ext.demo,'Try the demo')}${link(ext.repository,'Source')}${link(ext.documentation,'Function reference')}${link(ext.discussion,'GitHub discussion')}</div>
      </div>
      <div class="extension-status">
        <span class="state planned">${esc(ext.status)}</span>
        <p>${esc(ext.currentImplementation)}</p>
        <p>${esc(ext.integrationStatus)} ${link(ext.maintainerResponse,'Read the maintainer response')}</p>
        <details><summary>How core, font-ttf, and font-db could be reviewed</summary>
          <p class="small">A possible review path, rather than an accepted integration plan:</p>
          <ul>${ext.possiblePackageReview.map(item => `<li><strong>${esc(item.package)}</strong> — ${esc(item.scope)}</li>`).join('')}</ul>
          <p>${esc(ext.reviewBoundary)}</p>
        </details>
      </div>
    </section>
    <div class="shell developer-catalog">${groups}</div>
    <section class="section shell developer-foundations">
      <h2>Keep the text model in view.</h2>
      <p>Start with the representation your application needs, then choose its rendering and editing tools.</p>
      <div class="link-list"><a href="/characters/">FSW & SWU →</a><a href="https://office.signwriting.org/#publications">Publication library ↗</a><a href="/fonts/">Font setup & fidelity →</a><a href="/status/">App & API status →</a></div>
      <p class="small">The community app and API are still in development. The catalog links to packages and source projects; it does not establish availability of the future hosted service.</p>
    </section>`;
}
