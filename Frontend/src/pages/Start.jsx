import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

function useOrientation() {
  const getOrientation = () =>
    window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';

  const [orientation, setOrientation] = useState(getOrientation());

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(getOrientation());
    };

    window.addEventListener('resize', handleOrientationChange);

    return () => window.removeEventListener('resize', handleOrientationChange);
  }, []);

  return orientation;
}

const Start = () => {
        const orientation = useOrientation();
        
        useEffect(() => {
        if (orientation === 'landscape') {
                toast.info('Please switch to portrait mode for better experience', {
                    position: "top-center",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true
                });
        }
        }, [orientation]);
return (
    <div className='bg-cover bg-center h-screen flex flex-col justify-between' style={{ backgroundImage: "url('https://images.pexels.com/photos/2958070/pexels-photo-2958070.jpeg?auto=compress&cs=tinysrgb&w=600')" }}>
            <div>
                    <img src='https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png' alt='Uber Logo' className='w-32 pt-10 pl-10 invert' />
            </div>
            <div className='items-center text-center pb-20 mb-12 ml-5 mr-5 rounded-lg pt-10 bg-[#e6e9ec]'>
                    <h1 className=' text-4xl font-bold'>Welcome to Uber</h1>
                    <p className=' mt-4'>Get moving with Uber</p>
                    <Link to={'/signin'} ><button className='mt-8 bg-black text-white py-2 px-4 rounded w-56 text-xl'>Get Started</button></Link>
            </div>
    </div>
)
}

export default Start