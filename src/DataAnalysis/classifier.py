from torch import nn
import matplotlib.pyplot as plt
import os
import torch
from torch.utils.data import DataLoader, Dataset
import torch.nn.functional as F
from torchvision import transforms
from PIL import Image
import time
from autoencoder import Autoencoder
from sklearn.metrics import confusion_matrix as sk_confusion_matrix


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


class Classifier(nn.Module):
    def __init__(self, encoder):
        super(Classifier, self).__init__()
        self.encoder = encoder
        self.conv1 = nn.Conv2d(8, 16, kernel_size=3, stride=1, padding=1)
        self.pool = nn.MaxPool2d(2, 2)
        self.fc1 = nn.Linear(16 * 34 * 60, 4)

    def forward(self, x):
        x = self.encoder(x)
        x = self.pool(F.relu(self.conv1(x)))
        x = x.view(x.size(0), -1)  # Flatten the tensor
        x = self.fc1(x)
        x = F.softmax(x, dim=1)  # Apply softmax to the output layer
        return x


def train_classifier(model, n_epochs=100):
    # Load the dataset
    dataset = HeatmapDataset('results/heatmaps', transform=transform)
    dataloader = DataLoader(dataset, batch_size=18, shuffle=True)

    # Initialize the optimizer
    optimizer = torch.optim.Adam(model.parameters(), lr=0.00001)

    # Learning rate scheduler
    #scheduler = torch.optim.lr_scheduler.StepLR(optimizer, step_size=60, gamma=0.1)

    # Loss function
    criterion = nn.CrossEntropyLoss()

    # To store losses for plotting
    losses = []
    start_time = time.time()

    for epoch in range(n_epochs):
        for batch in dataloader:
            # Move the images and labels to the GPU
            images, labels = batch
            images = images.to(device)
            labels = labels.to(device)

            # Forward pass
            outputs = model(images)

            # Compute the loss
            loss = criterion(outputs, labels)

            # Backward pass and optimize
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

        # Update the learning rate
        #scheduler.step()

        # Record the loss for this epoch
        losses.append(loss.item())
        print(f"Epoch {epoch + 1}, Loss: {loss.item()}, time elapsed: {time.time() - start_time:.2f}s")

        # Save the model after each epoch
        if (epoch + 1) % 5 == 0:
            torch.save(model.state_dict(), f'classifier_epoch_{epoch + 1}.pth')

    print("Training finished.")

    # Plot the loss
    plt.figure(figsize=(10, 5))
    plt.plot(losses)
    plt.title('Loss over time')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.show()


if __name__ == '__main__':
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(device)

    autoencoder = Autoencoder()
    autoencoder.load_state_dict(torch.load('autoencoder.pth'))

    model = Classifier(autoencoder.encoder.to(device)).to(device)
    #train_classifier(model)
    #exit()
    model.load_state_dict(torch.load('classifier_epoch_100.pth'))

    with torch.no_grad():
        model.eval()
        # Initialize lists to store true and predicted labels
        y_true = []
        y_pred = []
        for participant in range(912, 922):
            for condition in range(29, 33):
                image_path = f'results/heatmaps/{participant}_{condition}_heatmap.png'
                image = Image.open(image_path).convert('L')
                image = transform(image).unsqueeze(0).to(device)
                output = model(image)
                print(
                    f"Participant {participant}, Condition {condition}, prediction: {torch.argmax(output).item() + 29}, probabilities: {output}")
                # Store the true and predicted labels
                y_true.append(condition)
                y_pred.append(torch.argmax(output).item() + 29)
        # Compute the confusion matrix using sklearn
        confusion_matrix = sk_confusion_matrix(y_true, y_pred, labels=[29, 30, 31, 32])
        # Print the confusion matrix
        print(f"Confusion Matrix: \n{confusion_matrix}")
        # Calculate accuracy for each condition
        for i in range(4):
            print(f"Accuracy for condition {i + 29}: {confusion_matrix[i, i] / confusion_matrix[i].sum()}")
