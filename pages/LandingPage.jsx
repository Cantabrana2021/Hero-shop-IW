import Title from '../components/Title'
import PublicProductCard from '../components/PublicProductCard'
import supabase from '../supabase/client'
import { Link } from 'react-router-dom'
import { useAuth } from './auth';
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logos/Hero-Shop-logo.webp';
import { useEffect, useState } from 'react'
import { IconArrowUp } from '@tabler/icons-react';
import { IconArrowDown } from '@tabler/icons-react';
import { IconSortAZ } from '@tabler/icons-react';
import { IconClock } from '@tabler/icons-react';
import { IconCoin } from '@tabler/icons-react';
import { IconSearch } from '@tabler/icons-react';
import { IconTags } from '@tabler/icons-react';
import { IconShoppingCart } from '@tabler/icons-react';
import { IconLogout } from '@tabler/icons-react';
import { IconUserCircle } from '@tabler/icons-react';
import { IconLogin } from '@tabler/icons-react';
import { IconTrash } from '@tabler/icons-react';

const LandingPage = () => {

	// eslint-disable-next-line no-unused-vars
	const navigate = useNavigate();

	const { isAuthenticated } = useAuth();
	const [userData, setUserData] = useState(null);

	const [fetchCartError, setFetchCartError] = useState(null)
	const [productosCart, setProductosCart] = useState(null)

	const [isMenuOpen, setIsMenuOpen] = useState(false);

	useEffect(() => {
		const fetchUserData = async () => {
			const { data: { user }, error: authError } = await supabase.auth.getUser();

			if (authError) {
				console.error('Error al obtener el usuario:', authError.message);
				return;
			}

			if (user) {
				const { data: userData, error: userError } = await supabase
					.from('usuarios')
					.select("*")
					.eq('id', user.id);

				if (userError) {
					console.error('Error al cargar el usuario:', userError.message);
					return;
				}

				if (userData) {
					setUserData(userData[0]);
					const { data: cartData, error: cartError } = await supabase
						.from('carrito')
						.select(`
							id,
							producto_id,
							cantidad,
							productos (
								id,
								nombre,
								precio,
								img_url
							)
						`)
						.eq('usuario_id', user.id);

					if (cartError) {
						setFetchCartError("Error al cargar el carrito");
						console.error('Error al cargar el carrito:', cartError.message);
						setProductosCart(null);
					} else {
						setProductosCart(cartData);
						setFetchCartError(null);
					}
				}
			} else {
				console.warn('Usuario no autenticado. Redirigiendo a la página de login.');
				navigate('/login');
			}
		};

		if (isAuthenticated) {
			fetchUserData();
		}
	}, [isAuthenticated, navigate]);

	const [fetchError, setFetchError] = useState(null)
	const [productos, setProductos] = useState(null)
	const [orderBy, setOrderBy] = useState('created_at')
	const [asc, setAsc] = useState(true)
	const [articulo, setArticulo] = useState('')


	const handleOrder = (order) => {
		if (orderBy === order) {
			setAsc(!asc)
		} else {
			setOrderBy(order)
			setAsc(true)
		}
	}

	const handleArticulo = (e) => {
		e.preventDefault()
		setArticulo(e.target.value)

		fetchSingleProducts()
	}

	const fetchSingleProducts = async () => {
		const { data, error } = await supabase
			.from('productos')
			.select()
			.order(orderBy, { ascending: asc })
			.ilike('nombre', `%${articulo}%`, {
				type: 'websearch'
			})

		if (error) {
			setFetchError("Error al cargar los productos")
			console.log('error', error)
			setProductos(null)
		}

		if (data.length <= 0) {
			setFetchError("No se encontraron productos con ese nombre")
			setProductos(null)
		}

		if (data) {
			setProductos(data)
			setFetchError(null)
		}
	}

	useEffect(() => {

		const fetchProducts = async () => {
			const { data, error } = await supabase
				.from('productos')
				.select()
				.order(orderBy, { ascending: asc })

			if (error) {
				setFetchError("Error al cargar los productos")
				console.log('error', error)
				setProductos(null)
			}

			if (data) {
				setProductos(data)
				setFetchError(null)
			}
		}
		if (articulo === '') {
			fetchProducts()
		}


	}, [orderBy, asc, articulo])


	let totalCart = 0;


	// useEffect(() => {

	// 	const fetchCart = async () => {
	// 		const { data, error } = await supabase
	// 			.from('carrito')
	// 			.select(`
	// 				id,
	// 				producto_id,
	// 				cantidad,
	// 				productos (
	// 					id,
	// 					nombre,
	// 					precio,
	// 					img_url
	// 				)
	// 			`)
	// 			.eq('usuario_id', userData.id)

	// 		if (error) {
	// 			setFetchCartError("Error al cargar el Carrito")
	// 			console.log('error', error)
	// 			setProductosCart(null)
	// 		}

	// 		if (data) {
	// 			setProductosCart(data)
	// 			setFetchCartError(null)
	// 		}
	// 	}
	// 	fetchCart()
	// }, [userData])


	async function handleDeleteProductCart(id) {
		const { error } = await supabase
			.from('carrito')
			.delete()
			.eq('id', id)

		if (error) {
			console.log('error', error)
		} else {
			console.log('Producto eliminado del carrito')
		}

	}

	if (productosCart) {
		productosCart.forEach(item => {
			totalCart += item.productos.precio * item.cantidad
		})
	}

	const handleLogOut = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.error('Error al cerrar sesión:', error.message);
		} else {
			// Redirigir al usuario a la página de inicio o realizar otras acciones
			console.log('Sesión cerrada correctamente');
		}
		navigate('/')
	}

	const [showModal, setShowModal] = useState(false);

	// Función para abrir el modal
	const openModal = () => {
		setShowModal(true);
	};

	// Función para cerrar el modal
	const closeModal = () => {
		setShowModal(false);
	};

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	return (

		<>
			<div>
				{/* Navbar */}
				<header className='flex justify-between w-full p-5 bg-primary'>
					<Link to="/" className="flex items-center">
						<img src={logo} className="rounded-full mr-3 h-6 sm:h-9" alt="Flowbite Logo" />
						<span className="self-center text-xl font-semibold whitespace-nowrap text-white">Hero-Shop</span>
					</Link>
					<style>

					</style>
					<form className="flex items-center max-w-sm mx-auto">
						<label htmlFor="simple-search" className="sr-only">Search</label>
						<div className="relative w-full">
							<div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
								<IconTags className='size-4 text-gray-500' stroke={2} />
							</div>
							<input type="text" id="simple-search"
								className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  "
								placeholder="Buscar"
								required
								onChange={(e) => setArticulo(e.target.value)} />
						</div>
						<button type="submit" onClick={handleArticulo}
							className="p-2.5 ms-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 ">
							<IconSearch className='size-6' stroke={2} />
							<span className="sr-only">Buscar</span>
						</button>
					</form>

					<div className='flex items-center'>
						{isAuthenticated && userData ? (
							<>
								<div className='flex gap-x-5 items-center'>
									<p className='text-white font-semibold hover:underline hover:underline-offset-4'>
										<Link to='/profile'>Bienvenido, {userData.nombre}.</Link>
									</p>

									{userData.img_user !== ''
										? <img
											onClick={toggleMenu}
											src={userData.img_user}
											alt="user"
											className="rounded-full size-12 cursor-pointer hover:opacity-80 hover:shadow-2xl transition-all duration-300 ease-in-out"
										/>
										: <IconUserCircle stroke={1.5} size={65} style={{ color: 'var(--primary-color)', margin: '-.9rem -.1rem', paddingRight: '2rem', paddingLeft: '.7rem' }} />
									}
									<button onClick={openModal}>
										<IconShoppingCart stroke={2} className='text-white' />
									</button>
								</div>
							</>
						) : (
							<Link to="/login" className="text-white border-b-2 border-primary hover:border-white flex ">
								<IconLogin stroke={2} className='mr-2' /> <p>Iniciar Sesion</p>
							</Link>
						)}

					</div>

					{isMenuOpen === true && (
						<div className="absolute border-2 top-20 right-5 mt-2 w-48 z-50 bg-white shadow-lg rounded-md font-semibold">
							<button to="/profile" onClick={() => navigate('/profile')} className="block w-full px-4 py-2 text-gray-800 hover:text-primary hover:bg-blue-100">
								<div className='flex gap-5 items-center mr-auto'>
									<IconUserCircle />Perfil
								</div>
							</button>
							<button onClick={handleLogOut} className="block w-full px-4 py-2 text-gray-800 hover:text-red-500 hover:bg-red-100">
								<div className='flex gap-5 items-center'>
									<IconLogout /> Cerrar sesión
								</div>
							</button>
						</div>
					)}

					{showModal && (
						<div id="deleteModal" tabIndex="-1" aria-hidden="true"
							className="bg-black/50 fixed inset-0 flex z-50 justify-center items-center w-full h-modal ">
							<div className="relative p-4 w-full max-w-md h-full md:h-auto">
								{/* <!-- Modal content --> */}
								<div className="relative p-4 text-center bg-white rounded-lg shadow sm:p-5" >

									<p className="text-xl font-bold border border-gray-300 rounded-md px-4 py-2 w-full">
										Carrito
									</p>

									<div className='grid gap-1 py-2'>
										{fetchCartError && <p>{fetchCartError}</p>}
										<div className='flex items-center gap-2 border-b-2 border-gray-200'>
											<table className='w-full text-left'>
												<thead>
													<tr>
														<th><p className='text-sm'>Imagen</p></th>
														<th><p className='text-sm'>Producto</p></th>
														<th><p className='text-sm'>Cantidad</p></th>
														<th><p className='text-sm'>Precio</p></th>
													</tr>
												</thead>
												<tbody>
													{productosCart && productosCart.map(item => (
														<tr key={item.id}>
															<td>
																<img
																	className='size-10 rounded-lg object-cover'
																	src={item.productos.img_url}
																	alt="IMG"
																/>
															</td>
															<td>
																<p className='text-sm'>{item.productos.nombre}</p>
															</td>
															<td>
																<p className='text-sm'>{item.cantidad}</p>
															</td>
															<td>
																<p className='text-sm'>${item.productos.precio}</p>
															</td>
															<td>
																<button
																	className='text-sm text-red-500'
																	onClick={() => handleDeleteProductCart(item.id)}>
																	<IconTrash stroke={2} />
																</button>
															</td>
														</tr>
													))}
													<tr className='border-t-2'>
														<td colSpan='3'>
															<p className='text-sm font-bold text-right px-2'>
																Total:
															</p>
														</td>
														<td>
															<p className='text-sm'>${totalCart}</p>
														</td>
													</tr>
												</tbody>
											</table>
										</div>
									</div>

									<div className="flex justify-center items-center space-x-4">
										<button onClick={closeModal} type="button"
											className="py-2 px-3 text-sm font-medium text-white bg-danger rounded-lg border border-gray-200 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 hover:text-gray-900 focus:z-10" data-modal-toggle="deleteModal">
											Cancelar
										</button>
										<Link to='/buy'>
											<button data-modal-toggle="deleteModal" type="button"
												className="py-2 px-3 text-sm font-medium text-white bg-primary rounded-lg border border-gray-200 hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 hover:text-gray-900 focus:z-10">
												Ir a pagar
											</button>
										</Link>

									</div>
								</div>
							</div>
						</div>
					)}


				</header>

				{/* Menu horizontal */}
				<nav id="menu-h" className="max-w-7xl mx-auto min-h-16 bg-black">
					<ul className="flex justify-center">
						<li><a href="#" className="text-white block py-4 px-6 text-lg">Inicio</a></li>
						<li className="relative group">
							<a href="#" className="text-white block py-4 px-6 text-lg">Quienes Somos</a>
							<ul className="absolute hidden bg-black pt-2">
								<li><a href="#" className="text-white block py-2 px-6 text-lg">Sobre Nosotros</a></li>
								<li><a href="#" className="text-white block py-2 px-6 text-lg">Mision</a></li>
								<li><a href="#" className="text-white block py-2 px-6 text-lg">Vision</a></li>
							</ul>
						</li>
						<li className="relative group">
							<a href="#" className="text-white block py-4 px-6 text-lg">Servicios</a>
							<ul className="absolute hidden bg-black pt-2">
								<li><a href="#" className="text-white block py-2 px-6 text-lg">Sobre Nosotros</a></li>
								<li><a href="#" className="text-white block py-2 px-6 text-lg">Mision</a></li>
								<li><a href="#" className="text-white block py-2 px-6 text-lg">Vision</a></li>
							</ul>
						</li>
						<li><Link to="/products" className="text-white block py-4 px-6 text-lg">Productos</Link></li>
						<li><a href="#" className="text-white block py-4 px-6 text-lg">Ofertas</a></li>
						<li><a href="#" className="text-white block py-4 px-6 text-lg">Garantia</a></li>
						<li><a href="#" className="text-white block py-4 px-6 text-lg">Contactenos</a></li>
						<button onClick={openModal} className="text-white block py-4 px-6 text-lg">Carrito </button>
						{isAuthenticated && userData?.rol === 1 && (
							<li><Link to="/dashboard" className="text-white block py-4 px-6 text-lg">Dashboard</Link></li>
						)}
					</ul>
				</nav>

				<section className="px-4 py-24 mx-auto max-w-7xl">
					<div className="w-full mx-auto text-left md:w-3/5 lg:w-2/5 md:text-center">
						<div className="mx-0 mb-6 avatar avatar-lg md:mx-auto"><img src="https://scontent.ftpq2-1.fna.fbcdn.net/v/t39.30808-6/342710836_217620224206157_8581303991229901859_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=5f2048&_nc_eui2=AeH_QUvRTvDbjSzA-QjYJBBGss-tWy7PvG-yz61bLs-8b01fwOR5Dvm-BV7k7Vajeju7mhI7jlyfizfDibLvD0vA&_nc_ohc=MBRCDGm-VusQ7kNvgGwQkpz&_nc_ht=scontent.ftpq2-1.fna&oh=00_AYAHkeuXLiRwWAiEHm-_CLbwlak02Rr68hja-RWD3yNe8w&oe=6656A716" alt="Photo of Praveen Juge" /></div>
						<h1 className="mb-6 text-xl font-bold text-gray-900 md:leading-tight md:text-3xl">
							“¡Bienvenidos a Hero-shop! Somos una tienda especializada en playeras estampadas.”
						</h1>

						<a href="https://www.facebook.com/HeroShop.15/about"><p className="mb-6 text-xs  tracking-widest text-purple-900 ">Facebook</p></a>

					</div>
				</section>
				{/* Separador de pagina */}
				<div className="max-w-7xl mx-auto min-h-[5px] flex justify-center items-center h-8 bg-blue-500">
					<div className="border-t border-blue-500 w-full"></div>
				</div>
				<section id="banner" className="max-w-7xl mx-auto min-h-[150px] bg-blue-900  overflow-hidden relative">
					<img src="https://media.vandalsports.com/master/12-2021/20211216124331_1.jpg" alt="Ichigo" className="object-cover w-full h-full" />
				</section>

				{/* Separador de pagina */}
				<div className="max-w-7xl mx-auto min-h-[5px] flex justify-center items-center h-8 bg-blue-500">
					<div className="border-t border-blue-500 w-full"></div>
				</div>

				<div className="flex flex-col justify-center items-center mx-auto max-w-[1200px] p-5">

					{/* Contenedor */}


					{/* Productos */}
					<section>
						<Title title={"Nuevos Productos"} />
						<div className='flex px-5 gap-x-5 w-full justify-end'>
							<p className='p-2'>Ordenar por:</p>
							<div className='p-2'>
								{!asc ? <IconArrowUp stroke={2} />
									: <IconArrowDown stroke={2} />}
							</div>
							<button onClick={() => handleOrder('created_at')} className={`flex items-center gap-1 p-2 border-b-2 ${orderBy === 'created_at' ? 'text-primary border-primary' : ''} hover:border-primary hover:text-primary`}>
								<IconClock stroke={2} />
								Creacion
							</button>
							<button onClick={() => handleOrder('nombre')} className={`flex items-center gap-1 p-2 border-b-2 ${orderBy === 'nombre' ? 'text-primary border-primary' : ''} hover:border-primary hover:text-primary`}>
								<IconSortAZ stroke={2} />
								Nombre
							</button>
							<button onClick={() => handleOrder('precio')} className={`flex items-center gap-1 p-2 border-b-2 ${orderBy === 'precio' ? 'text-primary border-primary' : ''} hover:border-primary hover:text-primary`}>
								<IconCoin stroke={2} />
								Precio
								{/* {!asc ? <svg xmlns="http://www.w3.org/2000/svg" className='size-5' viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><polyline points="6 9 12 15 18 9" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className='size-5' viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><polyline points="6 15 12 9 18 15" /></svg>} */}
							</button>
						</div>
						<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
							{fetchError && <p>{fetchError}</p>}
							{productos && productos.map(producto => (
								<PublicProductCard
									key={producto.id}
									id={producto.id}
									tipo={producto.tipo}
									nombre={producto.nombre}
									precio={producto.precio}
									imagen={producto.img_url}
								/>
							))}
						</div>
					</section>
					<br />
					<br />
					{/* Productos */}
					<section>
						<Title title={"Top Articulos"} />
						<div className='flex px-5 gap-x-5 w-full justify-end'>
							<p className='p-2'>Ordenar por:</p>
							<div className='p-2'>
								{!asc ? <IconArrowUp stroke={2} />
									: <IconArrowDown stroke={2} />}
							</div>
							<button onClick={() => handleOrder('created_at')} className={`flex items-center gap-1 p-2 border-b-2 ${orderBy === 'created_at' ? 'text-primary border-primary' : ''} hover:border-primary hover:text-primary`}>
								<IconClock stroke={2} />
								Creacion
							</button>
							<button onClick={() => handleOrder('nombre')} className={`flex items-center gap-1 p-2 border-b-2 ${orderBy === 'nombre' ? 'text-primary border-primary' : ''} hover:border-primary hover:text-primary`}>
								<IconSortAZ stroke={2} />
								Nombre
							</button>
							<button onClick={() => handleOrder('precio')} className={`flex items-center gap-1 p-2 border-b-2 ${orderBy === 'precio' ? 'text-primary border-primary' : ''} hover:border-primary hover:text-primary`}>
								<IconCoin stroke={2} />
								Precio
								{/* {!asc ? <svg xmlns="http://www.w3.org/2000/svg" className='size-5' viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><polyline points="6 9 12 15 18 9" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className='size-5' viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><polyline points="6 15 12 9 18 15" /></svg>} */}
							</button>
						</div>
						<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
							{fetchError && <p>{fetchError}</p>}
							{productos && productos.map(producto => (
								<PublicProductCard
									key={producto.id}
									id={producto.id}
									tipo={producto.tipo}
									nombre={producto.nombre}
									precio={producto.precio}
									imagen={producto.img_url}
								/>
							))}
						</div>
					</section>
					{/*Questions*/}
					<section className="px-4 py-24 mx-auto max-w-7xl">
						<h2 className="mb-4 text-xl font-bold md:text-3xl">Preguntas Mas Recientes</h2>
						<div className="grid grid-cols-1 gap-0 text-gray-600 md:grid-cols-2 md:gap-16">
							<div>
								<h5 className="mt-10 mb-3 font-semibold text-gray-900">Quienes somos?</h5>
								<p>
									HeroShop vende una amplia gama de ropa urbana y casual, desde camisetas y sudaderas hasta pantalones y accesorios.
								</p>
								<h5 className="mt-10 mb-3 font-semibold text-gray-900">HeroShop ofrece tallas para todas las personas?</h5>
								<p>Sí, HeroShop se esfuerza por ser inclusivo y ofrece una amplia gama de tallas para adaptarse a diversos tipos de cuerpo y estilos de vida.</p>
								<h5 className="mt-10 mb-3 font-semibold text-gray-900">Qué tipo de promociones o descuentos ofrece HeroShop?</h5>
								<p>
									HeroShop ofrece descuentos especiales en determinadas temporadas del año, como ventas de temporada, descuentos para estudiantes y promociones exclusivas para clientes leale
									<a href="https://help.hellonext.co/faq/startup-eligibility/" target="_blank">here</a>.
								</p>
								<h5 className="mt-10 mb-3 font-semibold text-gray-900">Qué diferencia a HeroShop de otras tiendas de ropa?</h5>
								<p>
									HeroShop se destaca por su enfoque en la moda urbana, ofreciendo una selección única de prendas y accesorios que reflejan las últimas tendencias de la calle y la cultura pop.
									<a href="https://paddle.com" target="_blank">Paddle</a> for processing payments.
								</p>
								<h5 className="mt-10 mb-3 font-semibold text-gray-900">HeroShop tiene alguna política de devolución o cambio?</h5>
								<p>Sí, HeroShop ofrece una política de devolución y cambio flexible, permitiendo a los clientes devolver o cambiar artículos dentro de un plazo determinado, siempre y cuando cumplan con las condiciones establecidas.</p>
							</div>
							<div>
								<h5 className="mt-10 mb-3 font-semibold text-gray-900">Cómo puedo estar al tanto de las últimas novedades y lanzamientos de productos de HeroShop?</h5>
								<p>
									Puedes seguir las redes sociales de HeroShop y suscribirte a su boletín informativo para recibir actualizaciones sobre nuevos productos, promociones y eventos especiales
								</p>
								<h5 className="mt-10 mb-3 font-semibold text-gray-900">Donde esta Ubicada Hero Shop?</h5>
								<p>
									Nos encontramos en Tepic Nayarit Centro, México, 63136
								</p>
								<div className="flex justify-center py-8">
									<div className="w-full max-w-4xl">
										<iframe
											src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1856.0481837457608!2d-104.90924776118366!3d21.503944990575125!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x842736f1bbc629c5%3A0xf8dafe44d09a6c83!2sIndependencia%2C%2063136%20Tepic%2C%20Nay.!5e0!3m2!1ses!2smx!4v1716756965468!5m2!1ses!2smx"
											width="600"
											height="450"
											style={{ border: 0 }}
											allowFullScreen=""
											loading="lazy"
											referrerPolicy="no-referrer-when-downgrade"
											className="w-full h-96"
										></iframe>
									</div>
								</div>
							</div>
						</div>
					</section>



					{/* Footer */}
					<footer className="flex flex-col items-center justify-between px-4 py-12 mx-auto max-w-7xl md:flex-row">
						<p className="mb-8 text-sm text-center text-gray-700 md:text-left md:mb-0">© Copyright 2024 Hero Shop  Derechos Reservados   </p>

						<div className="flex items-center space-x-6">
							<a href="#">
								<span className="sr-only"> Twitter</span>
								<svg xmlns="http://www.w3.org/2000/svg" width="2500" height="2031" viewBox="-0.25 -0.25 1109.5 901.5" className="w-5 h-5" aria-hidden="true">
									<path
										d="M741 .2V0h52l19 3.8c12.667 2.467 24.167 5.7 34.5 9.7 10.334 4 20.334 8.667 30 14 9.667 5.333 18.434 10.767 26.301 16.3 7.8 5.467 14.8 11.267 21 17.4C929.933 67.4 939.5 69 952.5 66s27-7.167 42-12.5 29.834-11.333 44.5-18c14.667-6.667 23.601-10.9 26.801-12.7 3.133-1.866 4.8-2.866 5-3l.199-.3 1-.5 1-.5 1-.5 1-.5.2-.3.3-.2.301-.2.199-.3 1-.3 1-.2-.199 1.5-.301 1.5-.5 1.5-.5 1.5-.5 1-.5 1-.5 1.5c-.333 1-.666 2.333-1 4-.333 1.667-3.5 8.333-9.5 20S1051 73 1042 85s-17.066 21.066-24.199 27.2c-7.2 6.2-11.967 10.533-14.301 13-2.333 2.533-5.166 4.866-8.5 7l-5 3.3-1 .5-1 .5-.199.3-.301.2-.3.2-.2.3-1 .5-1 .5-.199.3-.301.2-.3.2-.2.3-.199.3-.301.2-.3.2-.2.3h5l28-6c18.667-4 36.5-8.833 53.5-14.5l27-9 3-1 1.5-.5 1-.5 1-.5 1-.5 1-.5 2-.3 2-.2v2l-.5.2-.5.3-.199.3-.301.2-.3.2-.2.3-.199.3-.301.2-.3.2-.2.3-.199.3-.301.2-.5 1-.5 1-.3.2c-.133.2-4.366 5.866-12.7 17-8.333 11.2-12.833 16.866-13.5 17-.666.2-1.6 1.2-2.8 3-1.133 1.866-8.2 9.3-21.2 22.3s-25.732 24.566-38.199 34.7c-12.533 10.2-18.867 22.733-19 37.6-.2 14.8-.967 31.534-2.301 50.2-1.333 18.667-3.833 38.833-7.5 60.5-3.666 21.667-9.333 46.167-17 73.5-7.666 27.333-17 54-28 80s-22.5 49.333-34.5 70-23 38.167-33 52.5-20.166 27.833-30.5 40.5c-10.333 12.667-23.399 26.934-39.199 42.8-15.867 15.8-24.533 24.467-26 26-1.533 1.467-8.066 6.934-19.601 16.4-11.466 9.533-23.8 19.066-37 28.6-13.133 9.467-25.2 17.367-36.2 23.7s-24.266 13.566-39.8 21.7C630.734 840.4 614 848 596 855s-37 13.5-57 19.5-39.333 10.667-58 14c-18.666 3.333-39.833 6.167-63.5 8.5l-35.5 3.5v.5h-65v-.5l-8.5-.5c-5.666-.333-10.333-.667-14-1-3.666-.333-17.5-2.167-41.5-5.5s-42.833-6.667-56.5-10c-13.666-3.333-34-9.667-61-19s-50.1-18.767-69.3-28.3c-19.133-9.467-31.133-15.467-36-18-4.8-2.467-10.2-5.533-16.2-9.2l-9-5.5-.199-.3-.301-.2-.3-.2-.2-.3-1-.5-1-.5-.199-.3-.301-.2-.3-.2-.2-.3-.199-.3L.5 800H0v-2l1 .2 1 .3 4.5.5c3 .333 11.167.833 24.5 1.5 13.334.667 27.5.667 42.5 0s30.334-2.167 46-4.5c15.667-2.333 34.167-6.333 55.5-12 21.334-5.667 40.934-12.4 58.801-20.2 17.8-7.866 30.466-13.733 38-17.6 7.466-3.8 18.866-10.867 34.199-21.2l23-15.5.2-.3.3-.2.301-.2.199-.3.2-.3.3-.2.301-.2.199-.3 1-.3 1-.2.2-1 .3-1 .301-.2.199-.3-8-.5c-5.333-.333-10.5-.667-15.5-1s-12.833-1.833-23.5-4.5c-10.666-2.667-22.166-6.667-34.5-12-12.333-5.333-24.333-11.667-36-19-11.666-7.333-20.1-13.434-25.3-18.3-5.133-4.801-11.8-11.6-20-20.4-8.133-8.866-15.2-17.967-21.2-27.3s-11.733-20.101-17.199-32.3L124.5 551l-.5-1.5-.5-1.5-.3-1-.2-1 1.5.2 1.5.3 11 1.5c7.334 1 18.834 1.333 34.5 1 15.667-.333 26.5-1 32.5-2s9.667-1.667 11-2l2-.5 2.5-.5 2.5-.5.2-.3.3-.2.301-.2.199-.3-2-.5-2-.5-2-.5-2-.5-2-.5c-1.333-.333-3.666-1-7-2-3.333-1-12.333-4.667-27-11-14.666-6.333-26.333-12.5-35-18.5a241.7 241.7 0 0 1-24.8-19.7c-7.8-7.2-16.366-16.467-25.7-27.8-9.333-11.333-17.666-24.5-25-39.5-7.333-15-12.833-29.333-16.5-43a232.143 232.143 0 0 1-7.199-41.5L43 316l1 .2 1 .3 1 .5 1 .5 1 .5 1 .5 15.5 7c10.334 4.667 23.167 8.667 38.5 12 15.334 3.333 24.5 5.167 27.5 5.5l4.5.5h9l-.199-.3-.301-.2-.3-.2-.2-.3-.199-.3-.301-.2-.3-.2-.2-.3-1-.5-1-.5-.199-.3-.301-.2-.3-.2-.2-.3-1-.5-1-.5-.199-.3c-.2-.134-3.067-2.267-8.601-6.4-5.467-4.2-11.2-9.633-17.2-16.3s-12-13.667-18-21A162.158 162.158 0 0 1 77 271c-4.666-8.333-9.6-18.934-14.8-31.8-5.133-12.8-9.033-25.7-11.7-38.7-2.666-13-4.166-25.833-4.5-38.5-.333-12.667 0-23.5 1-32.5s3-19.167 6-30.5 7.334-23.333 13-36l8.5-19 .5-1.5.5-1.5.301-.2.199-.3.2-.3.3-.2.301.2.199.3.2.3.3.2.301.2.199.3.2.3.3.2.5 1 .5 1 .301.2.199.3 13.5 15c9 10 19.667 21.167 32 33.5 12.334 12.333 19.167 18.733 20.5 19.2 1.334.533 3 2.066 5 4.6 2 2.467 8.667 8.367 20 17.7 11.334 9.333 26.167 20.167 44.5 32.5 18.334 12.333 38.667 24.5 61 36.5 22.334 12 46.334 22.833 72 32.5 25.667 9.667 43.667 16 54 19 10.334 3 28 6.833 53 11.5s43.834 7.667 56.5 9c12.667 1.333 21.334 2.1 26 2.3l7 .2-.199-1.5-.301-1.5-2-12.5c-1.333-8.333-2-20-2-35s1.167-28.833 3.5-41.5c2.334-12.667 5.834-25.5 10.5-38.5 4.667-13 9.234-23.434 13.7-31.3 4.534-7.8 10.467-16.7 17.8-26.7 7.334-10 16.834-20.333 28.5-31 11.667-10.667 25-20.167 40-28.5s28.834-14.667 41.5-19c12.667-4.333 23.334-7.167 32-8.5 8.667-1.333 13-2.1 13-2.3z"
										fill="#5da8dc"
										stroke="#5da8dc"
										strokeWidth=".5"
									/>
									<path
										d="M0 399V0h741v.2c0 .2-4.333.966-13 2.3-8.666 1.333-19.333 4.167-32 8.5-12.666 4.333-26.5 10.667-41.5 19s-28.333 17.833-40 28.5c-11.666 10.667-21.166 21-28.5 31-7.333 10-13.266 18.9-17.8 26.7-4.466 7.866-9.033 18.3-13.7 31.3-4.666 13-8.166 25.833-10.5 38.5-2.333 12.667-3.5 26.5-3.5 41.5s.667 26.667 2 35l2 12.5.301 1.5.199 1.5-7-.2c-4.666-.2-13.333-.966-26-2.3-12.666-1.333-31.5-4.333-56.5-9s-42.666-8.5-53-11.5c-10.333-3-28.333-9.333-54-19-25.666-9.667-49.666-20.5-72-32.5-22.333-12-42.666-24.167-61-36.5-18.333-12.333-33.166-23.167-44.5-32.5-11.333-9.333-18-15.233-20-17.7-2-2.533-3.666-4.066-5-4.6-1.333-.467-8.166-6.867-20.5-19.2-12.333-12.333-23-23.5-32-33.5L80 44.5l-.199-.3-.301-.2-.5-1-.5-1-.3-.2-.2-.3-.199-.3-.301-.2-.3-.2-.2-.3-.199-.3-.301-.2-.3.2-.2.3-.199.3-.301.2-.5 1.5-.5 1.5L66 63c-5.666 12.667-10 24.667-13 36s-5 21.5-6 30.5-1.333 19.833-1 32.5c.334 12.667 1.834 25.5 4.5 38.5 2.667 13 6.567 25.9 11.7 38.7 5.2 12.866 10.134 23.466 14.8 31.8 4.667 8.333 10 16.167 16 23.5 6 7.333 12 14.333 18 21s11.733 12.1 17.2 16.3c5.533 4.134 8.4 6.267 8.601 6.4l.199.3 1 .5 1 .5.2.3.3.2.301.2.199.3 1 .5 1 .5.2.3.3.2.301.2.199.3.2.3.3.2.301.2.199.3h-9l-4.5-.5c-3-.333-12.166-2.167-27.5-5.5-15.333-3.333-28.166-7.333-38.5-12l-15.5-7-1-.5-1-.5-1-.5-1-.5-1-.3-1-.2 1.801 21c1.133 14 3.533 27.833 7.199 41.5 3.667 13.667 9.167 28 16.5 43 7.334 15 15.667 28.167 25 39.5 9.334 11.333 17.9 20.6 25.7 27.8a241.7 241.7 0 0 0 24.8 19.7c8.667 6 20.334 12.167 35 18.5 14.667 6.333 23.667 10 27 11 3.334 1 5.667 1.667 7 2l2 .5 2 .5 2 .5 2 .5 2 .5-.199.3-.301.2-.3.2-.2.3-2.5.5-2.5.5-2 .5c-1.333.333-5 1-11 2s-16.833 1.667-32.5 2c-15.666.333-27.166 0-34.5-1l-11-1.5-1.5-.3-1.5-.2.2 1 .3 1 .5 1.5.5 1.5 8.301 18.2C138.266 581.399 144 592.167 150 601.5s13.067 18.434 21.2 27.3c8.2 8.801 14.867 15.6 20 20.4 5.2 4.866 13.634 10.967 25.3 18.3 11.667 7.333 23.667 13.667 36 19 12.334 5.333 23.834 9.333 34.5 12 10.667 2.667 18.5 4.167 23.5 4.5s10.167.667 15.5 1l8 .5-.199.3-.301.2-.3 1-.2 1-1 .2-1 .3-.199.3-.301.2-.3.2-.2.3-.199.3-.301.2-.3.2-.2.3-23 15.5c-15.333 10.333-26.733 17.4-34.199 21.2-7.534 3.866-20.2 9.733-38 17.6-17.867 7.8-37.467 14.533-58.801 20.2-21.333 5.667-39.833 9.667-55.5 12-15.666 2.333-31 3.833-46 4.5s-29.166.667-42.5 0c-13.333-.667-21.5-1.167-24.5-1.5l-4.5-.5-1-.3-1-.2V399zM1107.801 109.8l.199-.3.5-.3.5-.2v792H382v-.5l35.5-3.5c23.667-2.333 44.834-5.167 63.5-8.5 18.667-3.333 38-8 58-14s39-12.5 57-19.5 34.734-14.6 50.2-22.8c15.534-8.134 28.8-15.367 39.8-21.7s23.067-14.233 36.2-23.7c13.2-9.533 25.534-19.066 37-28.6 11.534-9.467 18.067-14.934 19.601-16.4 1.467-1.533 10.133-10.2 26-26 15.8-15.866 28.866-30.133 39.199-42.8 10.334-12.667 20.5-26.167 30.5-40.5s21-31.833 33-52.5 23.5-44 34.5-70 20.334-52.667 28-80c7.667-27.333 13.334-51.833 17-73.5 3.667-21.667 6.167-41.833 7.5-60.5 1.334-18.667 2.101-35.4 2.301-50.2.133-14.866 6.467-27.4 19-37.6 12.467-10.134 25.199-21.7 38.199-34.7s20.067-20.434 21.2-22.3c1.2-1.8 2.134-2.8 2.8-3 .667-.134 5.167-5.8 13.5-17 8.334-11.134 12.567-16.8 12.7-17l.3-.2.5-1 .5-1 .301-.2.199-.3.2-.3.3-.2.301-.2.199-.3.2-.3.3-.2.301-.2zM812 3.8L793 0h316v107l-2 .2-2 .3-1 .5-1 .5-1 .5-1 .5-1.5.5-3 1-27 9c-17 5.667-34.833 10.5-53.5 14.5l-28 6h-5l.2-.3.3-.2.301-.2.199-.3.2-.3.3-.2.301-.2.199-.3 1-.5 1-.5.2-.3.3-.2.301-.2.199-.3 1-.5 1-.5 5-3.3c3.334-2.134 6.167-4.467 8.5-7 2.334-2.467 7.101-6.8 14.301-13C1024.933 106.066 1033 97 1042 85s16.5-23.833 22.5-35.5 9.167-18.333 9.5-20c.334-1.667.667-3 1-4l.5-1.5.5-1 .5-1 .5-1.5.5-1.5.301-1.5.199-1.5-1 .2-1 .3-.199.3-.301.2-.3.2-.2.3-1 .5-1 .5-1 .5-1 .5-.199.3c-.2.134-1.867 1.134-5 3-3.2 1.8-12.134 6.034-26.801 12.7-14.666 6.667-29.5 12.667-44.5 18s-29 9.5-42 12.5-22.566 1.4-28.699-4.8c-6.2-6.134-13.2-11.934-21-17.4-7.867-5.533-16.634-10.966-26.301-16.3a245.399 245.399 0 0 0-30-14c-10.333-4-21.833-7.233-34.5-9.7zM0 850.5V800h.5l.301.2.199.3.2.3.3.2.301.2.199.3 1 .5 1 .5.2.3.3.2.301.2.199.3 9 5.5c6 3.667 11.4 6.733 16.2 9.2 4.867 2.533 16.867 8.533 36 18 19.2 9.533 42.3 18.967 69.3 28.3s47.334 15.667 61 19c13.667 3.333 32.5 6.667 56.5 10s37.834 5.167 41.5 5.5c3.667.333 8.334.667 14 1l8.5.5v.5H0v-50.5z"
										fill="#fff"
										stroke="#fff"
										strokeWidth=".5"
									/>
								</svg>
							</a>

							<a href="#">
								<span className="sr-only">Instagram</span>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2500 2500" width="2500" height="2500" className="w-5 h-5" aria-hidden="true">
									<defs>
										<radialGradient id="0" cx="332.14" cy="2511.81" r="3263.54" gradientUnits="userSpaceOnUse">
											<stop offset=".09" stopColor="#fa8f21" />
											<stop offset=".78" stopColor="#d82d7e" />
										</radialGradient>
										<radialGradient id="1" cx="1516.14" cy="2623.81" r="2572.12" gradientUnits="userSpaceOnUse">
											<stop offset=".64" stopColor="#8c3aaa" stopOpacity="0" />
											<stop offset="1" stopColor="#8c3aaa" />
										</radialGradient>
									</defs>
									<path
										d="M833.4,1250c0-230.11,186.49-416.7,416.6-416.7s416.7,186.59,416.7,416.7-186.59,416.7-416.7,416.7S833.4,1480.11,833.4,1250m-225.26,0c0,354.5,287.36,641.86,641.86,641.86S1891.86,1604.5,1891.86,1250,1604.5,608.14,1250,608.14,608.14,895.5,608.14,1250M1767.27,582.69a150,150,0,1,0,150.06-149.94h-0.06a150.07,150.07,0,0,0-150,149.94M745,2267.47c-121.87-5.55-188.11-25.85-232.13-43-58.36-22.72-100-49.78-143.78-93.5s-70.88-85.32-93.5-143.68c-17.16-44-37.46-110.26-43-232.13-6.06-131.76-7.27-171.34-7.27-505.15s1.31-373.28,7.27-505.15c5.55-121.87,26-188,43-232.13,22.72-58.36,49.78-100,93.5-143.78s85.32-70.88,143.78-93.5c44-17.16,110.26-37.46,232.13-43,131.76-6.06,171.34-7.27,505-7.27s373.28,1.31,505.15,7.27c121.87,5.55,188,26,232.13,43,58.36,22.62,100,49.78,143.78,93.5s70.78,85.42,93.5,143.78c17.16,44,37.46,110.26,43,232.13,6.06,131.87,7.27,171.34,7.27,505.15s-1.21,373.28-7.27,505.15c-5.55,121.87-25.95,188.11-43,232.13-22.72,58.36-49.78,100-93.5,143.68s-85.42,70.78-143.78,93.5c-44,17.16-110.26,37.46-232.13,43-131.76,6.06-171.34,7.27-505.15,7.27s-373.28-1.21-505-7.27M734.65,7.57c-133.07,6.06-224,27.16-303.41,58.06C349,97.54,279.38,140.35,209.81,209.81S97.54,349,65.63,431.24c-30.9,79.46-52,170.34-58.06,303.41C1.41,867.93,0,910.54,0,1250s1.41,382.07,7.57,515.35c6.06,133.08,27.16,223.95,58.06,303.41,31.91,82.19,74.62,152,144.18,221.43S349,2402.37,431.24,2434.37c79.56,30.9,170.34,52,303.41,58.06C868,2498.49,910.54,2500,1250,2500s382.07-1.41,515.35-7.57c133.08-6.06,223.95-27.16,303.41-58.06,82.19-32,151.86-74.72,221.43-144.18s112.18-139.24,144.18-221.43c30.9-79.46,52.1-170.34,58.06-303.41,6.06-133.38,7.47-175.89,7.47-515.35s-1.41-382.07-7.47-515.35c-6.06-133.08-27.16-224-58.06-303.41-32-82.19-74.72-151.86-144.18-221.43S2150.95,97.54,2068.86,65.63c-79.56-30.9-170.44-52.1-303.41-58.06C1632.17,1.51,1589.56,0,1250.1,0S868,1.41,734.65,7.57"
										fill="url(#0)"
									/>
									<path
										d="M833.4,1250c0-230.11,186.49-416.7,416.6-416.7s416.7,186.59,416.7,416.7-186.59,416.7-416.7,416.7S833.4,1480.11,833.4,1250m-225.26,0c0,354.5,287.36,641.86,641.86,641.86S1891.86,1604.5,1891.86,1250,1604.5,608.14,1250,608.14,608.14,895.5,608.14,1250M1767.27,582.69a150,150,0,1,0,150.06-149.94h-0.06a150.07,150.07,0,0,0-150,149.94M745,2267.47c-121.87-5.55-188.11-25.85-232.13-43-58.36-22.72-100-49.78-143.78-93.5s-70.88-85.32-93.5-143.68c-17.16-44-37.46-110.26-43-232.13-6.06-131.76-7.27-171.34-7.27-505.15s1.31-373.28,7.27-505.15c5.55-121.87,26-188,43-232.13,22.72-58.36,49.78-100,93.5-143.78s85.32-70.88,143.78-93.5c44-17.16,110.26-37.46,232.13-43,131.76-6.06,171.34-7.27,505-7.27s373.28,1.31,505.15,7.27c121.87,5.55,188,26,232.13,43,58.36,22.62,100,49.78,143.78,93.5s70.78,85.42,93.5,143.78c17.16,44,37.46,110.26,43,232.13,6.06,131.87,7.27,171.34,7.27,505.15s-1.21,373.28-7.27,505.15c-5.55,121.87-25.95,188.11-43,232.13-22.72,58.36-49.78,100-93.5,143.68s-85.42,70.78-143.78,93.5c-44,17.16-110.26,37.46-232.13,43-131.76,6.06-171.34,7.27-505.15,7.27s-373.28-1.21-505-7.27M734.65,7.57c-133.07,6.06-224,27.16-303.41,58.06C349,97.54,279.38,140.35,209.81,209.81S97.54,349,65.63,431.24c-30.9,79.46-52,170.34-58.06,303.41C1.41,867.93,0,910.54,0,1250s1.41,382.07,7.57,515.35c6.06,133.08,27.16,223.95,58.06,303.41,31.91,82.19,74.62,152,144.18,221.43S349,2402.37,431.24,2434.37c79.56,30.9,170.34,52,303.41,58.06C868,2498.49,910.54,2500,1250,2500s382.07-1.41,515.35-7.57c133.08-6.06,223.95-27.16,303.41-58.06,82.19-32,151.86-74.72,221.43-144.18s112.18-139.24,144.18-221.43c30.9-79.46,52.1-170.34,58.06-303.41,6.06-133.38,7.47-175.89,7.47-515.35s-1.41-382.07-7.47-515.35c-6.06-133.08-27.16-224-58.06-303.41-32-82.19-74.72-151.86-144.18-221.43S2150.95,97.54,2068.86,65.63c-79.56-30.9-170.44-52.1-303.41-58.06C1632.17,1.51,1589.56,0,1250.1,0S868,1.41,734.65,7.57"
										fill="url(#1)"
									/>
								</svg>
							</a>
							<a href="#">
								<span className="sr-only">Facebook</span>
								<svg xmlns="https://www.facebook.com/HeroShop.15/about" width="1298" height="2500" viewBox="88.428 12.828 107.543 207.085" className="w-5 h-5" aria-hidden="true">
									<path
										d="M158.232 219.912v-94.461h31.707l4.747-36.813h-36.454V65.134c0-10.658 2.96-17.922 18.245-17.922l19.494-.009V14.278c-3.373-.447-14.944-1.449-28.406-1.449-28.106 0-47.348 17.155-47.348 48.661v27.149H88.428v36.813h31.788v94.461l38.016-.001z"
										fill="#3c5a9a"
									/>
								</svg>
							</a>
						</div>
					</footer>
				</div>
			</div>
		</>
	)
}

export default LandingPage 