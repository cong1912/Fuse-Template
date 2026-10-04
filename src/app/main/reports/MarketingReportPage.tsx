import React from 'react';
import DataTable from 'src/admin-kit/DataTable';

function MarketingReportPage() {
	return (
		<div className="p-24 w-full">
			<h1 className="text-2xl font-bold mb-4">MarketingReportPage</h1>
			<DataTable
				data={[]}
				columns={[]}
				loading={false}
			/>
		</div>
	);
}

export default MarketingReportPage;
