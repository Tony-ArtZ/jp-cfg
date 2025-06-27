import { useContext } from "react";
import UserContext from "../context/UserContext";

const Profile = () => {
  const { user } = useContext(UserContext);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Profile
        </h2>

        {user && (
          <div className="space-y-4">
            <div>
              <span className="font-medium">Name:</span> {user.name}
            </div>
            <div>
              <span className="font-medium">Email:</span> {user.email}
            </div>
            {user.age && (
              <div>
                <span className="font-medium">Age:</span> {user.age}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
