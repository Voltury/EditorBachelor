from torch import nn
import matplotlib.pyplot as plt
import os
import torch
from torch.utils.data import DataLoader, Dataset
import torch.nn.functional as F
from torchvision import transforms
from PIL import Image
import numpy as np
import time


class Encoder(nn.Module):
    def __init__(self):
        super(Encoder, self).__init__()
        self.enc1 = nn.Conv2d(1, 64, kernel_size=3, stride=2, padding=1)
        self.enc2 = nn.Conv2d(64, 32, kernel_size=3, stride=2, padding=1)
        self.enc3 = nn.Conv2d(32, 16, kernel_size=3, stride=2, padding=1)
        self.enc4 = nn.Conv2d(16, 8, kernel_size=3, stride=2, padding=1)

    def forward(self, x):
        x = torch.relu(self.enc1(x))
        x = torch.relu(self.enc2(x))
        x = torch.relu(self.enc3(x))
        x = torch.relu(self.enc4(x))
        return x


class Decoder(nn.Module):
    def __init__(self):
        super(Decoder, self).__init__()
        self.dec1 = nn.ConvTranspose2d(8, 16, kernel_size=3, stride=2, padding=1, output_padding=1)
        self.dec2 = nn.ConvTranspose2d(16, 32, kernel_size=3, stride=2, padding=1, output_padding=1)
        self.dec3 = nn.ConvTranspose2d(32, 64, kernel_size=3, stride=2, padding=1, output_padding=1)
        self.dec4 = nn.ConvTranspose2d(64, 1, kernel_size=3, stride=2, padding=1, output_padding=1)

    def forward(self, x):
        x = torch.relu(self.dec1(x))
        x = torch.relu(self.dec2(x))
        x = torch.relu(self.dec3(x))
        x = self.dec4(x)
        x = torch.sigmoid(x[:, :, :1080, :1920])  # Crop the output to match the input size
        return x


class Autoencoder(nn.Module):
    def __init__(self):
        super(Autoencoder, self).__init__()
        self.encoder = Encoder()
        self.decoder = Decoder()

    def forward(self, x):
        x = self.encoder(x)
        x = self.decoder(x)
        return x


class HeatmapDataset(Dataset):
    def __init__(self, directory, transform=None):
        self.directory = directory
        self.transform = transform
        self.file_list = os.listdir(directory)

    def __len__(self):
        return len(self.file_list)

    def __getitem__(self, idx):
        img_path = os.path.join(self.directory, self.file_list[idx])
        image = Image.open(img_path).convert('L')
        if self.transform:
            image = self.transform(image)

        # Extract the condition ID from the file name
        condition_id = int(self.file_list[idx].split('_')[1])

        return image, F.one_hot(torch.tensor(condition_id - 29), num_classes=4).float()


# Create a transform to preprocess the data
transform = transforms.Compose([
    transforms.ToTensor(),
])


def train_autoencoder(model, n_epochs=100):
    # Load the dataset
    dataset = HeatmapDataset('results/heatmaps', transform=transform)
    dataloader = DataLoader(dataset, batch_size=18, shuffle=True)

    # Initialize the optimizer
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

    # Learning rate scheduler
    scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=30, gamma=0.1)

    # Loss function
    criterion = nn.MSELoss()

    # To store losses for plotting
    losses = []
    start_time = time.time()

    for epoch in range(n_epochs):
        for batch in dataloader:
            # Move the images to the GPU
            images, _ = batch
            images = images.to(device)

            # Forward pass
            outputs = model(images)

            # Compute the loss
            loss = criterion(outputs, images)

            # Backward pass and optimize
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

        # Update the learning rate
        scheduler.step()

        # Record the loss for this epoch
        losses.append(loss.item())
        print(f"Epoch {epoch + 1}, Loss: {loss.item()}, time elapsed: {time.time() - start_time:.2f}s")

        # Save the model after each epoch
        torch.save(model.state_dict(), f'autoencoder_epoch_{epoch + 1}.pth')

    print("Training finished.")

    # Plot the loss
    plt.figure(figsize=(10, 5))
    plt.plot(losses)
    plt.title('Loss over time')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.show()


def reconstruct_image(model, image_path):
    with torch.no_grad():
        # Load the image
        image = Image.open(image_path).convert('L')
        image = transform(image).unsqueeze(0).to(device)

        # Reconstruct the image using the autoencoder
        output = model(image)

        # Convert the output tensor to a PIL image
        output = output.squeeze().detach().cpu().numpy()
        output = (output * 255).astype(np.uint8)
        output = Image.fromarray(output)
    return output


device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
