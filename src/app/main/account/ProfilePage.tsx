import React from 'react';

function ProfilePage() {
	return (
		<div className="p-24 w-full">
			<h1 className="text-2xl font-bold mb-4">Profile</h1>
			<form className="flex flex-col gap-4 max-w-md">
				<input
					type="text"
					placeholder="Name"
					className="border p-2 rounded"
				/>
				<input
					type="email"
					placeholder="Email"
					className="border p-2 rounded"
				/>
				<button
					type="submit"
					className="bg-blue-500 text-white px-4 py-2 rounded"
				>
					Update Profile
				</button>
			</form>
		</div>
	);
}

export default ProfilePage;
