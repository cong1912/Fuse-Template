import { orange } from '@mui/material/colors';
import { lighten, styled } from '@mui/material/styles';
import clsx from 'clsx';
import FuseUtils from '@fuse/utils';
import { Controller, useFormContext } from 'react-hook-form';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Box from '@mui/material/Box';
import { EcommerceProduct } from '../../ECommerceApi';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProps } from 'react-beautiful-dnd';
import { useEffect, useState } from 'react';

const Root = styled('div')(({ theme }) => ({
	'& .productImageFeaturedStar': {
		position: 'absolute',
		top: 0,
		right: 0,
		color: orange[400],
		opacity: 0
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
			}
		},
		'&.featured': {
			pointerEvents: 'none',
			boxShadow: theme.shadows[3],
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
	const methods = useFormContext();
	const { control, watch, setValue } = methods;

	const images = watch('images') as EcommerceProduct['images'];

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

	return (
		<Root>
			<div className="flex justify-center sm:justify-start flex-wrap -mx-16">
				<Controller
					name="images"
					control={control}
					render={({ field: { onChange, value } }) => (
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
								onChange={async (e) => {
									function readFileAsync() {
										return new Promise((resolve, reject) => {
											const file = e?.target?.files?.[0];
											if (!file) {
												return;
											}
											const reader = new FileReader();

											reader.onload = () => {
												resolve({
													id: FuseUtils.generateGUID(),
													url: `data:${file.type};base64,${btoa(reader.result as string)}`,
													type: 'image'
												});
											};

											reader.onerror = reject;

											reader.readAsBinaryString(file);
										});
									}

									const newImage = await readFileAsync();

									onChange([...(value as EcommerceProduct['images'] || []), newImage]);
								}}
							/>
							<FuseSvgIcon
								size={32}
								color="action"
							>
								heroicons-outline:upload
							</FuseSvgIcon>
						</Box>
					)}
				/>
				
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
