// Routing is independent of catalogue membership and lesson approval.
export function resolveGame(kcId, kind, config, canonicalIds, liteIds) {
  const no = reason => ({status: reason, url: null, classroomReady: false});
  if (!canonicalIds.includes(kcId)) return no('unknown_kc');
  if (kind === 'lite' && !liteIds.includes(kcId)) return no('outside_current_lite_scope');
  const a = config?.adapters?.[kind];
  if (!a || !['journey_hash', ...(kind === 'lite' ? ['kc_hash'] : [])].includes(a.routeKind)) return no('route_unsupported');
  if (!['source_verified_in_supplied_baseline','source_verified'].includes(a.routeSyntaxState)) return no('route_unsupported');
  if (kind === 'lite' && a.bridgeVerification !== 'verified') return no('route_unsupported');
  if (!a.baseUrl) return no('base_url_missing');
  const packaged = a.deploymentScope === 'same_origin_package';
  if (packaged && (kind !== 'lite' || a.routeKind !== 'kc_hash' || a.baseUrl !== '/lite/')) return no('invalid_base_url');
  let u;
  try { u = new URL(a.baseUrl, packaged ? 'https://package.invalid' : undefined); } catch { return no('invalid_base_url'); }
  if (!['http:', 'https:'].includes(u.protocol) || u.username || u.password) return no('invalid_base_url');
  if (!Array.isArray(a.runtimeAvailability?.ids) || a.runtimeAvailability.state !== 'verified_compiled_index') return no('runtime_index_missing');
  if (!a.runtimeAvailability.ids.includes(kcId)) return no('kc_not_implemented');
  u.search = ''; u.hash = ''; if (!u.pathname.endsWith('/') && !/\.[a-z0-9]+$/i.test(u.pathname)) u.pathname += '/';
  u.hash = (a.routeKind === 'kc_hash' ? 'kc/' : 'journey/') + encodeURIComponent(kcId);
  const result = {url: u.href, classroomReady: false, requiresFreshDocument: true, target: '_blank', rel: 'noopener', releaseReview: a.releaseReview ?? 'unverified'};
  if (packaged) return {...result, url: u.pathname + u.hash, status: 'same_origin_package', packageReady: true};
  const host=u.hostname.toLowerCase().replace(/\.$/,'');
  const local = host === 'localhost' || host.endsWith('.localhost') || host.startsWith('127.') || ['[::1]', '[::]', '0.0.0.0'].includes(host) || host.startsWith('[::ffff:7f');
  if (local || a.deploymentScope === 'local_preview') return {...result, status: 'local_preview_only'};
  if (a.endpointVerification !== 'verified') return {...result, status: 'endpoint_unverified'};
  if (!['public', 'classroom_network'].includes(a.deploymentScope) || a.studentReachability !== 'verified') return {...result, status: 'student_reachability_unverified'};
  return {...result, status: 'ready', classroomReady: true};
}

