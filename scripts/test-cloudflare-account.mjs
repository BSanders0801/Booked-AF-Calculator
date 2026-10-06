// Resolve deployment metadata without exposing encrypted values or changing Cloudflare.
export async function resolveTestAccount(raw, readCloudflare) {
  let id = String(raw || '').trim().toLowerCase();
  const dashboard = /^https:\/\/dash\.cloudflare\.com\/([a-f0-9]{32})(?:\/[^\s]*)?$/.exec(id);
  if (dashboard) id = dashboard[1];
  let recovered = id !== raw;
  if (!/^[a-f0-9]{32}$/.test(id)) {
    const accounts = await readCloudflare('/accounts?per_page=50');
    if (!Array.isArray(accounts.result) || accounts.result.length !== 1 ||
        (accounts.result_info?.total_count ?? accounts.result.length) !== 1 ||
        (accounts.result_info?.total_pages ?? 1) > 1 ||
        !/^[a-f0-9]{32}$/.test(accounts.result[0]?.id || ''))
      throw Error('Cloudflare account cannot be recovered unambiguously. No provider changes made.');
    id = accounts.result[0].id;
    recovered = true;
  }
  const subdomain = (await readCloudflare(`/accounts/${id}/workers/subdomain`)).result?.subdomain;
  // Account identity confirmed against the workers.dev host supplied by the owner.
  if (subdomain !== 'wild-recipe-42df')
    throw Error('Cloudflare account does not match the approved BOOKED AF workers.dev host. No provider changes made.');
  return {id, subdomain, recovered};
}
