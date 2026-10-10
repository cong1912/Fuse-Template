import { orange } from '@mui/material/colors';
import { lighten, styled } from '@mui/material/styles';
import clsx from 'clsx';
import FuseUtils from '@fuse/utils';
import { Controller, useFormContext } from 'react-hook-form';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import { EcommerceProduct } from '../../ECommerceApi';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProps } from 'react-beautiful-dnd';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const Root = styled('div')(({ theme }) => ({
	'& .productImageFeaturedStar': {
		position: 'absolute',
		top: 4,
		right: 4,
		color: orange[400],
		opacity: 0,
		zIndex: 10
	},

	'& .productImageDelete': {
		position: 'absolute',
		top: 4,
		left: 4,
		opacity: 0,
		zIndex: 10,
		backgroundColor: 'rgba(255, 255, 255, 0.85)',
		transition: 'opacity 0.15s ease-in-out',
		'&:hover': {
			backgroundColor: '#ef4444',
			color: '#ffffff'
		}
	},

	'& .productImageUpload': {
		transitionProperty: 'box-shadow',
		transitionDuration: theme.transitions.duration.short,
		transitionTimingFunction: theme.transitions.easing.easeInOut
	},

	'& .productImageItem': {
		transitionProperty: 'box-shadow',
		transitionDuration: theme.transitions.duration.short,
		transitionTimingFunction: theme.transitions.easing.easeInOut,
		'&:hover': {
			'& .productImageFeaturedStar': {
				opacity: 0.8
			},
			'& .productImageDelete': {
				opacity: 1
			}
		},
		'&.featured': {
			boxShadow: theme.shadows[4],
			border: `2px solid ${orange[400]}`,
			'& .productImageFeaturedStar': {
				opacity: 1
			},
			'&:hover .productImageFeaturedStar': {
				opacity: 1
			}
		}
	}
}));

const StrictModeDroppable = ({ children, ...props }: DroppableProps) => {
	const [enabled, setEnabled] = useState(false);
	useEffect(() => {
		const animation = requestAnimationFrame(() => setEnabled(true));
		return () => {
			cancelAnimationFrame(animation);
			setEnabled(false);
		};
	}, []);
	if (!enabled) {
		return null;
	}
	return <Droppable {...props}>{children}</Droppable>;
};

/**
 * The product images tab.
 */
function ProductImagesTab() {
	const routeParams = useParams();
	const { productId } = routeParams;
	const methods = useFormContext();
	const { control, watch, setValue } = methods;
	const [isUploading, setIsUploading] = useState(false);

	const images = (watch('images') || []) as EcommerceProduct['images'];
	const featuredImageId = watch('featuredImageId');

	const onDragEnd = (result: DropResult) => {
		if (!result.destination) {
			return;
		}

		const startIndex = result.source.index;
		const endIndex = result.destination.index;

		const newImages = Array.from(images);
		const [removed] = newImages.splice(startIndex, 1);
		newImages.splice(endIndex, 0, removed);

		setValue('images', newImages, { shouldDirty: true, shouldValidate: true });
	};

	const handleDeleteImage = async (imageId: string) => {
		if (productId && productId !== 'new' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(imageId)) {
			try {
				const token = localStorage.getItem('jwt_access_token');
				await fetch(`/api/products/${productId}/images/${imageId}`, {
					method: 'DELETE',
					headers: token ? { Authorization: `Bearer ${token}` } : {}
				});
			} catch (err) {
				console.error('Failed to delete image on server:', err);
			}
		}

		const filtered = images.filter((img) => img.id !== imageId);
		setValue('images', filtered, { shouldDirty: true, shouldValidate: true });
		if (featuredImageId === imageId) {
			setValue('featuredImageId', filtered.length > 0 ? filtered[0].id : '', { shouldDirty: true });
		}
	};

	return (
		<Root>
			<div className="flex justify-center sm:justify-start flex-wrap -mx-16">
				<Box
					sx={{
						backgroundColor: (theme) =>
							theme.palette.mode === 'light'
								? lighten(theme.palette.background.default, 0.4)
								: lighten(theme.palette.background.default, 0.02)
					}}
					component="label"
					htmlFor="button-file"
					className="productImageUpload flex items-center justify-center relative w-128 h-128 rounded-16 mx-12 mb-24 overflow-hidden cursor-pointer shadow hover:shadow-lg"
				>
					<input
						accept="image/*"
						className="hidden"
						id="button-file"
						type="file"
						disabled={isUploading}
						onChange={async (e) => {
							const file = e?.target?.files?.[0];
							if (!file) return;

							setIsUploading(true);
							try {
								const formData = new FormData();
								formData.append('file', file);
								const token = localStorage.getItem('jwt_access_token');
								const uploadRes = await fetch('/api/files/upload?folder=products', {
									method: 'POST',
									headers: token ? { Authorization: `Bearer ${token}` } : {},
									body: formData
								});

								if (!uploadRes.ok) {
									throw new Error(`Upload failed with status ${uploadRes.status}`);
								}

								const uploadData = await uploadRes.json();
								const uploadedUrl = uploadData.url;

								if (productId && productId !== 'new') {
									const addImgRes = await fetch(`/api/products/${productId}/images`, {
										method: 'POST',
										headers: {
											'Content-Type': 'application/json',
											...(token ? { Authorization: `Bearer ${token}` } : {})
										},
										body: JSON.stringify({
											imageUrl: uploadedUrl,
											altText: 'Product image',
											isMain: !images || images.length === 0
										})
									});

									if (addImgRes.ok) {
										const newImgDto = await addImgRes.json();
										const newImg = {
											id: newImgDto.id,
											url: newImgDto.url,
											type: 'image',
											isMain: newImgDto.isMain
										};
										const updated = [...images, newImg];
										setValue('images', updated, { shouldDirty: true, shouldValidate: true });
										if (newImgDto.isMain || !featuredImageId) {
											setValue('featuredImageId', newImgDto.id, { shouldDirty: true });
										}
									}
								} else {
									const newImg = {
										id: FuseUtils.generateGUID(),
										url: uploadedUrl,
										type: 'image'
									};
									const updated = [...images, newImg];
									setValue('images', updated, { shouldDirty: true, shouldValidate: true });
									if (!featuredImageId) {
										setValue('featuredImageId', newImg.id, { shouldDirty: true });
									}
								}
							} catch (err) {
								console.error('Image upload failed:', err);
							} finally {
								setIsUploading(false);
								e.target.value = '';
							}
						}}
					/>
					{isUploading ? (
						<CircularProgress size={32} />
					) : (
						<FuseSvgIcon size={32} color="action">
							heroicons-outline:upload
						</FuseSvgIcon>
					)}
				</Box>

				<DragDropContext onDragEnd={onDragEnd}>
					<StrictModeDroppable droppableId="product-images" direction="horizontal">
						{(provided) => (
							<div
								ref={provided.innerRef}
								{...provided.droppableProps}
								className="flex flex-wrap"
							>
								<Controller
									name="featuredImageId"
									control={control}
									defaultValue=""
									render={({ field: { onChange, value } }) => {
										return (
											<>
												{images.map((media, index) => (
													<Draggable
														key={media.id}
														draggableId={media.id}
														index={index}
													>
														{(provided, snapshot) => (
															<div
																ref={provided.innerRef}
																{...provided.draggableProps}
																{...provided.dragHandleProps}
																onClick={() => onChange(media.id)}
																onKeyDown={() => onChange(media.id)}
																role="button"
																tabIndex={0}
																className={clsx(
																	'productImageItem flex items-center justify-center relative w-128 h-128 rounded-16 mx-12 mb-24 overflow-hidden cursor-pointer outline-none shadow hover:shadow-lg',
																	media.id === value && 'featured',
																	snapshot.isDragging && 'shadow-xl'
																)}
															>
																<IconButton
																	size="small"
																	className="productImageDelete"
																	onClick={(e) => {
																		e.stopPropagation();
																		handleDeleteImage(media.id);
																	}}
																>
																	<FuseSvgIcon size={16}>heroicons-outline:trash</FuseSvgIcon>
																</IconButton>
																<FuseSvgIcon className="productImageFeaturedStar">
																	heroicons-solid:star
																</FuseSvgIcon>
																<img
																	className="max-w-none w-auto h-full"
																	src={media.url}
																	alt="product"
																/>
															</div>
														)}
													</Draggable>
												))}
												{provided.placeholder}
											</>
										);
									}}
								/>
							</div>
						)}
					</StrictModeDroppable>
				</DragDropContext>
			</div>
		</Root>
	);
}

export default ProductImagesTab;
