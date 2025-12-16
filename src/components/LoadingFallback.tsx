export function LoadingFallback() {
	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="text-center">
				<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
				<p className="mt-4 text-gray-600">로딩 중...</p>
			</div>
		</div>
	);
}

export function PageLoadingFallback() {
	return (
		<div className="container mx-auto px-4 py-12">
			<div className="text-center">
				<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
				<p className="mt-4 text-gray-600">로딩 중...</p>
			</div>
		</div>
	);
}
