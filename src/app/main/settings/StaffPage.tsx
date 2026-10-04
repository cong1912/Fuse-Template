import React from 'react';
import DataTable from 'src/admin-kit/DataTable';

function StaffPage() {
	return (
		<div className="p-24 w-full">
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-2xl font-bold">Staff Members</h1>
				<button className="bg-blue-500 text-white px-4 py-2 rounded">Invite</button>
			</div>
			<DataTable
				data={[]}
				columns={[]}
				loading={false}
			/>
		</div>
	);
}

export default StaffPage;
